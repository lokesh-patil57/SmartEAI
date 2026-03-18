import { callGeminiText, parseJsonFromAiText } from './ai.service.js';

const DEFAULT_JOB_PARSE = {
  position: '',
  company: '',
  technicalSkills: [],
  softSkills: [],
  requirements: [],
  benefits: [],
  jobType: '',
  stipend: '',
  experienceLevel: '',
};

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/,|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeParsedJob(data = {}) {
  return {
    position: String(data.position || '').trim(),
    company: String(data.company || '').trim(),
    technicalSkills: [...new Set(toArray(data.technicalSkills))],
    softSkills: [...new Set(toArray(data.softSkills))],
    requirements: [...new Set(toArray(data.requirements))],
    benefits: [...new Set(toArray(data.benefits))],
    jobType: String(data.jobType || '').trim(),
    stipend: String(data.stipend || '').trim(),
    experienceLevel: String(data.experienceLevel || '').trim(),
  };
}

function fallbackParse(jobText = '') {
  const lines = String(jobText).split('\n').map((line) => line.trim()).filter(Boolean);
  const position = lines[0] || '';
  const company = lines.find((line) => /company|at\s+[A-Z]/i.test(line)) || '';

  const detectedSkills = [
    'react', 'node', 'express', 'mongodb', 'docker', 'kubernetes', 'aws', 'graphql', 'typescript', 'javascript',
  ].filter((skill) => jobText.toLowerCase().includes(skill));

  return normalizeParsedJob({
    ...DEFAULT_JOB_PARSE,
    position,
    company,
    technicalSkills: detectedSkills,
    requirements: lines.slice(0, 8),
  });
}

export async function parseJobDescription(jobText = '') {
  if (!jobText || typeof jobText !== 'string') {
    return { ...DEFAULT_JOB_PARSE };
  }

  if (!process.env.GEMINI_API_KEY) {
    return fallbackParse(jobText);
  }

  const prompt = `You are SmartEAI's job description parser.
Return strict JSON only with keys:
position, company, technicalSkills, softSkills, requirements, benefits, jobType, stipend, experienceLevel.
No markdown, no explanations.

Job description:\n${jobText.slice(0, 18000)}`;

  try {
    const text = await callGeminiText({ prompt });
    const parsed = parseJsonFromAiText(text, DEFAULT_JOB_PARSE);
    return normalizeParsedJob({ ...DEFAULT_JOB_PARSE, ...parsed });
  } catch {
    return fallbackParse(jobText);
  }
}
