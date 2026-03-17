import { callGeminiText, parseJsonFromAiText } from './ai.service.js';

const DEFAULT_RESUME_SKILLS = {
  name: '',
  skills: [],
  tools: [],
  frameworks: [],
  projects: [],
  experience: [],
  education: [],
};

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/,|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeExtracted(data = {}) {
  return {
    name: String(data.name || '').trim(),
    skills: [...new Set(toArray(data.skills))],
    tools: [...new Set(toArray(data.tools))],
    frameworks: [...new Set(toArray(data.frameworks))],
    projects: [...new Set(toArray(data.projects))],
    experience: [...new Set(toArray(data.experience))],
    education: [...new Set(toArray(data.education))],
  };
}

function fallbackExtract(resumeText = '') {
  const lines = String(resumeText).split('\n').map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] || '';
  const foundSkills = [
    'react', 'node', 'express', 'mongodb', 'docker', 'kubernetes', 'aws', 'graphql', 'typescript', 'javascript', 'python', 'java',
  ].filter((skill) => resumeText.toLowerCase().includes(skill));

  return normalizeExtracted({
    ...DEFAULT_RESUME_SKILLS,
    name: firstLine.length < 60 ? firstLine : '',
    skills: foundSkills,
    tools: foundSkills.filter((skill) => ['docker', 'kubernetes', 'aws'].includes(skill)),
    frameworks: foundSkills.filter((skill) => ['react', 'express'].includes(skill)),
    projects: lines.filter((line) => /project|built|developed|implemented/i.test(line)).slice(0, 8),
    experience: lines.filter((line) => /experience|intern|engineer|developer/i.test(line)).slice(0, 8),
    education: lines.filter((line) => /b\.?tech|bachelor|master|university|college/i.test(line)).slice(0, 5),
  });
}

export async function extractResumeSkills(resumeText = '') {
  if (!resumeText || typeof resumeText !== 'string') {
    return { ...DEFAULT_RESUME_SKILLS };
  }

  if (!process.env.GEMINI_API_KEY) {
    return fallbackExtract(resumeText);
  }

  const prompt = `You are SmartEAI's resume skill extraction engine.
Return strict JSON only with keys:
name, skills, tools, frameworks, projects, experience, education.
No markdown, no explanations.

Resume text:\n${resumeText.slice(0, 18000)}`;

  try {
    const text = await callGeminiText({ prompt });
    const parsed = parseJsonFromAiText(text, DEFAULT_RESUME_SKILLS);
    return normalizeExtracted({ ...DEFAULT_RESUME_SKILLS, ...parsed });
  } catch {
    return fallbackExtract(resumeText);
  }
}
