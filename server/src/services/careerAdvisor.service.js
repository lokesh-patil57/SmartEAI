import { callGeminiText, parseJsonFromAiText } from './ai.service.js';

const DEFAULT_PLAN = {
  learningPlan: [],
  recommendedProjects: [],
  resumeTips: [],
};

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/,|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePlan(payload = {}) {
  return {
    learningPlan: [...new Set(toArray(payload.learningPlan))],
    recommendedProjects: [...new Set(toArray(payload.recommendedProjects))],
    resumeTips: [...new Set(toArray(payload.resumeTips))],
  };
}

function fallbackPlan({ missingSkills = [] } = {}) {
  return {
    learningPlan: missingSkills.slice(0, 5).map((skill, index) => `Week ${index + 1}: Learn fundamentals of ${skill} and add one practical exercise.`),
    recommendedProjects: missingSkills.slice(0, 3).map((skill) => `Build a mini project highlighting ${skill} and document outcomes.`),
    resumeTips: [
      'Quantify impact for each project bullet using metrics.',
      'Mirror top job keywords naturally in skills and experience sections.',
      'Group tools/frameworks by category for ATS readability.',
    ],
  };
}

export async function generateCareerRecommendations({ resumeSkills = [], missingSkills = [], targetJobSkills = [] } = {}) {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackPlan({ missingSkills });
  }

  const prompt = `You are SmartEAI's career advisor.
Based on:
Resume Skills: ${JSON.stringify(resumeSkills)}
Missing Skills: ${JSON.stringify(missingSkills)}
Target Job Skills: ${JSON.stringify(targetJobSkills)}

Return strict JSON only with keys: learningPlan, recommendedProjects, resumeTips.
Keep each list concise and actionable.
No markdown or explanations.`;

  try {
    const text = await callGeminiText({ prompt });
    const parsed = parseJsonFromAiText(text, DEFAULT_PLAN);
    const normalized = normalizePlan({ ...DEFAULT_PLAN, ...parsed });
    if (!normalized.learningPlan.length && !normalized.recommendedProjects.length && !normalized.resumeTips.length) {
      return fallbackPlan({ missingSkills });
    }
    return normalized;
  } catch {
    return fallbackPlan({ missingSkills });
  }
}
