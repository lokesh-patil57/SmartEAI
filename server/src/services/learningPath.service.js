import { callGeminiText, parseJsonFromAiText } from './ai.service.js';

const DEFAULT_RESULT = {
  learningRoadmap: [],
  recommendedProjects: [],
  technologiesToLearnNext: [],
};

function toArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeResult(payload = {}) {
  return {
    learningRoadmap: [...new Set(toArray(payload.learningRoadmap || payload.learningPlan))],
    recommendedProjects: [...new Set(toArray(payload.recommendedProjects))],
    technologiesToLearnNext: [...new Set(toArray(payload.technologiesToLearnNext || payload.techToLearn))],
  };
}

function fallbackResult({ missingSkills = [] } = {}) {
  return {
    learningRoadmap: missingSkills.slice(0, 5).map((skill, index) => `Week ${index + 1}: Learn ${skill} and implement one focused exercise.`),
    recommendedProjects: missingSkills.slice(0, 3).map((skill) => `Build one mini project demonstrating ${skill} in a production-style workflow.`),
    technologiesToLearnNext: missingSkills.slice(0, 6),
  };
}

export async function generateLearningPath({ resumeSkills = [], missingSkills = [], targetJobRole = '', targetJobSkills = [] } = {}) {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackResult({ missingSkills });
  }

  const prompt = `You are SmartEAI's learning recommendation engine.
Based on the user profile below, return JSON only with keys:
learningRoadmap, recommendedProjects, technologiesToLearnNext

Resume skills: ${JSON.stringify(resumeSkills)}
Missing skills: ${JSON.stringify(missingSkills)}
Target role: ${targetJobRole || 'Not specified'}
Target job skills: ${JSON.stringify(targetJobSkills)}

Constraints:
- Keep each array concise (3-8 entries).
- Focus on realistic learning sequence.
- No markdown, no explanations.`;

  try {
    const text = await callGeminiText({ prompt });
    const parsed = parseJsonFromAiText(text, DEFAULT_RESULT);
    const normalized = normalizeResult(parsed);
    if (!normalized.learningRoadmap.length && !normalized.recommendedProjects.length) {
      return fallbackResult({ missingSkills });
    }
    return normalized;
  } catch {
    return fallbackResult({ missingSkills });
  }
}
