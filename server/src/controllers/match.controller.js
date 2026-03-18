import { extractSkillSignals, matchResumeToJob } from '../services/ats.service.js';
import { generateLearningPath } from '../services/learningPath.service.js';
import { buildRagPrompt } from '../services/ragPromptBuilder.service.js';
import { callGeminiText, parseJsonFromAiText } from '../services/ai.service.js';
import { Application } from '../models/Application.js';

async function generateRagInsights({ resume, job, resumeSkills, jobSkills, relatedSkills, missingSkills }) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      summary: 'Rule-based ATS analysis completed. Add missing skills using realistic project evidence.',
      suggestions: [],
      quickWins: [],
    };
  }

  const prompt = buildRagPrompt({
    resumeSkills,
    jobSkills,
    relatedSkills,
    missingSkills,
    jobDescription: job,
    resumeText: resume,
  });

  try {
    const text = await callGeminiText({ prompt });
    return parseJsonFromAiText(text, {
      summary: 'RAG analysis generated.',
      suggestions: [],
      quickWins: [],
    });
  } catch {
    return {
      summary: 'Rule-based ATS analysis completed. AI insights unavailable at the moment.',
      suggestions: [],
      quickWins: [],
    };
  }
}

function buildBaseResponse(result) {
  return {
    score: result.score,
    matchScore: result.score,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    suggestions: result.suggestions,
    relatedSkills: [],
    learningPlan: [],
    matched_skills: result.matchedSkills,
    missing_skills: result.missingSkills,
    related_skills: [],
    learning_plan: [],
    breakdown: result.breakdown,
  };
}

export async function postMatch(req, res, next) {
  try {
    const { resume, job } = req.body;
    const result = await matchResumeToJob(resume, job, { includeSemantic: false, includeLearningPlan: false });
    const base = buildBaseResponse(result);
    let applicationId = null;

    // Auto-create Application record for authenticated users
    if (req.user?._id) {
      const jobLines = job.split('\n').map((l) => l.trim()).filter(Boolean);
      try {
        const application = await Application.create({
          userId: req.user._id,
          jobTitle: jobLines[0]?.slice(0, 120) || 'Untitled Role',
          company: jobLines[1]?.slice(0, 80) || 'Unknown Company',
          jobDescription: job,
          requiredSkills: [...(result.matchedSkills || []), ...(result.missingSkills || [])],
          matchedSkills: result.matchedSkills || [],
          missingSkills: result.missingSkills || [],
          matchScore: result.score || 0,
          timeline: [{ action: 'ATS Analysis', timestamp: new Date() }],
        });
        applicationId = application?._id?.toString() || null;
      } catch {
        applicationId = null;
      }
    }

    res.json({ ...base, applicationId });
  } catch (err) {
    next(err);
  }
}

export async function postMatchRelatedSkills(req, res, next) {
  try {
    const { resume, job } = req.body;
    const result = await matchResumeToJob(resume, job, { includeSemantic: true, includeLearningPlan: false });
    res.json({
      score: result.score,
      matchScore: result.score,
      relatedSkills: result.relatedSkills,
      related_skills: result.relatedSkills,
    });
  } catch (err) {
    next(err);
  }
}

export async function postMatchLearningPath(req, res, next) {
  try {
    const { resume, job } = req.body;
    const base = await matchResumeToJob(resume, job, { includeSemantic: false, includeLearningPlan: false });
    const resumeSkills = extractSkillSignals(resume, { includeExperience: true });
    const jobSkills = extractSkillSignals(job, { includeExperience: false });

    const learning = await generateLearningPath({
      resumeSkills,
      missingSkills: base.missingSkills,
      targetJobRole: jobSkills[0] || '',
      targetJobSkills: jobSkills,
    });

    res.json({
      learningPlan: learning.learningRoadmap,
      learning_plan: learning.learningRoadmap,
      recommendedProjects: learning.recommendedProjects,
      technologiesToLearnNext: learning.technologiesToLearnNext,
    });
  } catch (err) {
    next(err);
  }
}

export async function postMatchInsights(req, res, next) {
  try {
    const { resume, job } = req.body;
    const base = await matchResumeToJob(resume, job, { includeSemantic: true, includeLearningPlan: false });
    const resumeSkills = extractSkillSignals(resume, { includeExperience: true });
    const jobSkills = extractSkillSignals(job, { includeExperience: false });
    const ragInsights = await generateRagInsights({
      resume,
      job,
      resumeSkills,
      jobSkills,
      relatedSkills: base.relatedSkills,
      missingSkills: base.missingSkills,
    });

    res.json({
      ragInsights,
      relatedSkills: base.relatedSkills,
      related_skills: base.relatedSkills,
    });
  } catch (err) {
    next(err);
  }
}
