import { parseJobDescription } from '../services/jobParser.service.js';
import { extractResumeSkills } from '../services/resumeSkillExtractor.service.js';
import { matchSkills } from '../services/skillMatcher.service.js';
import { matchResumeToJob } from '../services/ats.service.js';
import { generateCareerRecommendations } from '../services/careerAdvisor.service.js';
import { Job } from '../models/Job.js';
import { Analysis } from '../models/Analysis.js';

async function runJobIntelligence({ resume = '', job = '' }) {
  const [jobSummary, resumeSummary] = await Promise.all([
    parseJobDescription(job),
    extractResumeSkills(resume),
  ]);

  const jobSkillUniverse = [
    ...(jobSummary.technicalSkills || []),
    ...(jobSummary.softSkills || []),
  ];

  const resumeSkillUniverse = [
    ...(resumeSummary.skills || []),
    ...(resumeSummary.tools || []),
    ...(resumeSummary.frameworks || []),
  ];

  const skillMatch = matchSkills(resumeSkillUniverse, jobSkillUniverse);
  const atsResult = await matchResumeToJob(resume, job);

  const recommendations = await generateCareerRecommendations({
    resumeSkills: resumeSkillUniverse,
    missingSkills: atsResult.missingSkills,
    targetJobSkills: jobSkillUniverse,
  });

  return {
    jobSummary,
    resumeSummary,
    skillMatch,
    atsResult: {
      ...atsResult,
      learningPlan: recommendations.learningPlan,
      learning_plan: recommendations.learningPlan,
      suggestedProjects: recommendations.recommendedProjects,
      recommended_projects: recommendations.recommendedProjects,
      resumeTips: recommendations.resumeTips,
      resume_tips: recommendations.resumeTips,
    },
    recommendations,
  };
}

async function maybeStoreAnalysis(req, payload) {
  if (!req.user?._id) return null;

  const jobDoc = await Job.create({
    title: payload.jobSummary.position,
    company: payload.jobSummary.company,
    technicalSkills: payload.jobSummary.technicalSkills,
    softSkills: payload.jobSummary.softSkills,
    requirements: payload.jobSummary.requirements,
    benefits: payload.jobSummary.benefits,
    jobType: payload.jobSummary.jobType,
    stipend: payload.jobSummary.stipend,
    experienceLevel: payload.jobSummary.experienceLevel,
  });

  const analysis = await Analysis.create({
    userId: req.user._id,
    jobId: jobDoc._id,
    matchedSkills: payload.atsResult.matchedSkills,
    missingSkills: payload.atsResult.missingSkills,
    relatedSkills: payload.atsResult.relatedSkills,
    matchScore: payload.atsResult.score,
    suggestions: payload.atsResult.suggestions,
    learningPlan: payload.atsResult.learningPlan,
  });

  return {
    jobId: jobDoc._id.toString(),
    analysisId: analysis._id.toString(),
  };
}

export async function postJobParse(req, res, next) {
  try {
    const { jobText = '' } = req.body;
    const parsed = await parseJobDescription(jobText);
    res.json(parsed);
  } catch (err) {
    next(err);
  }
}

export async function postJobAnalyze(req, res, next) {
  try {
    const { resume = '', job = '' } = req.body;
    const payload = await runJobIntelligence({ resume, job });
    const persisted = await maybeStoreAnalysis(req, payload);

    res.json({
      ...payload,
      ...(persisted || {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function postJobMatch(req, res, next) {
  try {
    const { resume = '', job = '' } = req.body;
    const payload = await runJobIntelligence({ resume, job });
    const persisted = await maybeStoreAnalysis(req, payload);

    res.json({
      score: payload.atsResult.score,
      matchedSkills: payload.atsResult.matchedSkills,
      missingSkills: payload.atsResult.missingSkills,
      relatedSkills: payload.atsResult.relatedSkills,
      suggestions: payload.atsResult.suggestions,
      learningPlan: payload.atsResult.learningPlan,
      learning_plan: payload.atsResult.learningPlan,
      matched_skills: payload.atsResult.matchedSkills,
      missing_skills: payload.atsResult.missingSkills,
      related_skills: payload.atsResult.relatedSkills,
      ...(persisted || {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobHistory(req, res, next) {
  try {
    const history = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(25)
      .populate({ path: 'jobId', select: 'title company technicalSkills experienceLevel createdAt' })
      .lean();

    const data = history.map((item) => ({
      id: item._id.toString(),
      createdAt: item.createdAt,
      matchScore: item.matchScore,
      matchedSkills: item.matchedSkills || [],
      missingSkills: item.missingSkills || [],
      relatedSkills: item.relatedSkills || [],
      learningPlan: item.learningPlan || [],
      job: item.jobId
        ? {
          id: item.jobId._id?.toString?.() || '',
          title: item.jobId.title || '',
          company: item.jobId.company || '',
          technicalSkills: item.jobId.technicalSkills || [],
          experienceLevel: item.jobId.experienceLevel || '',
          createdAt: item.jobId.createdAt,
        }
        : null,
    }));

    res.json({ history: data });
  } catch (err) {
    next(err);
  }
}
