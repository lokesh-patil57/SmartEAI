/**
 * ATS (Applicant Tracking System) Resume ↔ Job Matching
 * Rule-based only. No AI. Source of truth for skills.
 */

import { matchSkills } from './skillMatcher.service.js';
import { findRelatedSkills as semanticFindRelatedSkills } from './semanticSkillMatcher.service.js';

const WEIGHTS = { core: 50, tools: 30, experience: 20 };
const MAX_SCORE = 100;
const REALISTIC_MAX = 85;
const REALISTIC_MIN = 50;

const CORE_SKILLS = [
  'react', 'vue', 'angular', 'node', 'nodejs', 'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'golang', 'rust',
  'sql', 'database', 'api', 'rest', 'graphql', 'frontend', 'backend', 'fullstack', 'full-stack', 'machine learning', 'ml', 'data science',
  'html', 'css', 'redux', 'express', 'django', 'flask', 'spring', 'aws', 'cloud', 'devops', 'testing', 'agile', 'scrum',
  'oop', 'git', 'ci/cd', 'cicd', 'linux', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'k8s',
];

const TOOLS = [
  'git', 'github', 'gitlab', 'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'jenkins', 'terraform', 'ansible',
  'figma', 'jira', 'confluence', 'postman', 'vs code', 'vscode', 'webpack', 'npm', 'yarn', 'linux', 'ubuntu', 'macos',
  'tableau', 'power bi', 'excel', 'slack', 'notion', 'vercel', 'netlify', 'heroku', 'firebase', 'graphql', 'rest',
];

const EXPERIENCE_TERMS = [
  'internship', 'intern', 'project', 'projects', 'experience', 'frontend', 'backend', 'fullstack', 'full-stack',
  'team', 'collaboration', 'lead', 'led', 'developed', 'built', 'implemented', 'designed', 'engineered',
  'startup', 'industry', 'production', 'deployed', 'maintained', 'mentored', 'cross-functional',
];

function normalize(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-./]/g, ' ')
    .trim();
}

function tokenize(normalized) {
  const words = normalized.split(/\s+/).filter(Boolean);
  const twoWords = [];
  for (let i = 0; i < words.length - 1; i++) {
    twoWords.push(`${words[i]} ${words[i + 1]}`);
  }
  return { words: [...new Set(words)], bigrams: [...new Set(twoWords)] };
}

function extractInText(vocabulary, normalized, tokens) {
  const found = new Set();
  const fullText = normalized;
  for (const term of vocabulary) {
    const lower = term.toLowerCase();
    if (fullText.includes(lower)) found.add(term);
    if (tokens.words.some((w) => w === lower || w.includes(lower))) found.add(term);
    if (tokens.bigrams.some((b) => b.includes(lower))) found.add(term);
  }
  return [...found];
}

export function extractSkillSignals(text, { includeExperience = false } = {}) {
  const normalized = normalize(text);
  const tokens = tokenize(normalized);
  const skills = [
    ...extractInText(CORE_SKILLS, normalized, tokens),
    ...extractInText(TOOLS, normalized, tokens),
    ...(includeExperience ? extractInText(EXPERIENCE_TERMS, normalized, tokens) : []),
  ];

  return [...new Set(skills)];
}

function scoreCategory(found, total, weight) {
  if (total === 0) return weight;
  return Math.round((found / total) * weight);
}

/**
 * Rule-based suggestions for missing skills (no AI).
 */
const SUGGESTION_RULES = [
  { pattern: /docker|container/i, message: 'Mention any container exposure (Docker, Podman, or similar) if applicable.' },
  { pattern: /aws|cloud|azure|gcp/i, message: 'Add cloud exposure if applicable (e.g. coursework, side projects).' },
  { pattern: /api|rest|graphql/i, message: 'Use REST API or GraphQL terminology where you have built or consumed APIs.' },
  { pattern: /react|vue|angular/i, message: 'Highlight frontend framework experience and any related projects.' },
  { pattern: /python|java|node|go/i, message: 'List projects or coursework that used this language.' },
  { pattern: /git|version control/i, message: 'Mention Git/version control and collaboration (e.g. branching, PRs).' },
  { pattern: /testing|jest|cypress|unit test/i, message: 'Include any testing experience (unit, integration, or e2e).' },
  { pattern: /agile|scrum|jira/i, message: 'Reference Agile/Scrum or project management tools if you have used them.' },
  { pattern: /sql|database|mongodb|postgres/i, message: 'Add database or data modeling experience where relevant.' },
  { pattern: /ci\/cd|jenkins|github actions/i, message: 'Mention CI/CD or automation pipelines if you have exposure.' },
  { pattern: /kubernetes|k8s/i, message: 'If you have any container orchestration exposure, mention it.' },
  { pattern: /machine learning|ml|data science/i, message: 'Highlight relevant coursework or projects in ML/data.' },
];

function getSuggestionsForMissing(missingSkills) {
  const suggestions = [];
  const text = missingSkills.join(' ').toLowerCase();
  for (const rule of SUGGESTION_RULES) {
    if (rule.pattern.test(text)) suggestions.push(rule.message);
  }
  return [...new Set(suggestions)];
}

/**
 * Critical tools that, if missing, apply a hard penalty.
 */
const CRITICAL_TOOLS = ['git', 'api', 'rest', 'docker', 'aws', 'sql', 'javascript', 'python', 'react', 'node'];

function buildLearningPlan(missingSkills = []) {
  return missingSkills.slice(0, 5).map((skill, index) =>
    `Week ${index + 1}: practice ${skill} using one focused mini-project and document outcomes.`
  );
}

async function findRelatedSkills(missingSkills = [], resumeText = '') {
  const related = new Set();
  const normalizedResume = normalize(resumeText);

  for (const skill of missingSkills) {
    const candidates = await semanticFindRelatedSkills(skill, { topK: 5, minSimilarity: 0.3 });
    for (const candidate of candidates) {
      const candidateName = candidate.skill;
      if (!candidateName) continue;
      if (normalizedResume.includes(candidateName.toLowerCase())) {
        related.add(candidateName);
      }
    }
  }

  return [...related];
}

export function getSuggestions(missingSkills) {
  const fromRules = getSuggestionsForMissing(missingSkills);
  if (fromRules.length > 0) return fromRules;
  return missingSkills.map((s) => `Consider adding experience or exposure related to: ${s}.`);
}

/**
 * Main ATS match: resume vs job. Returns score (realistic 50–80%), matched/missing skills, suggestions, breakdown.
 */
export async function matchResumeToJob(resume, job, options = {}) {
  const { includeSemantic = false, includeLearningPlan = true } = options;
  const normResume = normalize(resume);
  const normJob = normalize(job);
  const resTokens = tokenize(normResume);
  const jobTokens = tokenize(normJob);

  const coreInJob = extractInText(CORE_SKILLS, normJob, jobTokens);
  const toolsInJob = extractInText(TOOLS, normJob, jobTokens);
  const expInJob = extractInText(EXPERIENCE_TERMS, normJob, jobTokens);

  const matchedCore = coreInJob.filter((c) => normResume.includes(c.toLowerCase()) || resTokens.words.some((w) => w.includes(c)));
  const matchedTools = toolsInJob.filter((t) => normResume.includes(t.toLowerCase()) || resTokens.words.some((w) => w.includes(t)));
  const matchedExp = expInJob.filter((e) => normResume.includes(e.toLowerCase()) || resTokens.words.some((w) => w.includes(e)));

  const missingCore = coreInJob.filter((c) => !matchedCore.includes(c));
  const missingTools = toolsInJob.filter((t) => !matchedTools.includes(t));
  const missingExp = expInJob.filter((e) => !matchedExp.includes(e));

  const totalCore = coreInJob.length || 1;
  const totalTools = toolsInJob.length || 1;
  const totalExp = expInJob.length || 1;

  let coreScore = scoreCategory(matchedCore.length, totalCore, WEIGHTS.core);
  let toolsScore = scoreCategory(matchedTools.length, totalTools, WEIGHTS.tools);
  let expScore = scoreCategory(matchedExp.length, totalExp, WEIGHTS.experience);

  let rawScore = coreScore + toolsScore + expScore;

  const missingAll = [...missingCore, ...missingTools, ...missingExp];
  const criticalMissing = CRITICAL_TOOLS.filter((ct) =>
    jobTokens.words.some((w) => w.includes(ct)) || normJob.includes(ct)
  ).filter((ct) => !normResume.includes(ct) && !matchedTools.some((t) => t.includes(ct)) && !matchedCore.some((c) => c.includes(ct)));

  if (criticalMissing.length > 0) {
    const penalty = Math.min(25, criticalMissing.length * 8);
    rawScore = Math.max(0, rawScore - penalty);
  }

  let relatedSkills = [];
  if (includeSemantic) {
    const skillMatch = matchSkills(
      [...matchedCore, ...matchedTools, ...matchedExp],
      [...coreInJob, ...toolsInJob]
    );
    relatedSkills = await findRelatedSkills(skillMatch.missingSkills, resume);
    const relatedSkillBonus = Math.min(12, relatedSkills.length * 2);
    rawScore = Math.min(MAX_SCORE, rawScore + relatedSkillBonus);
  }

  rawScore = Math.min(MAX_SCORE, rawScore);
  const realisticScore = Math.min(REALISTIC_MAX, Math.max(REALISTIC_MIN, rawScore));

  const matchedSkills = [...new Set([...matchedCore, ...matchedTools, ...matchedExp])];
  const missingSkills = [...new Set([...missingCore, ...missingTools, ...missingExp])];
  const suggestions = getSuggestions(missingSkills);
  const learningPlan = includeLearningPlan ? buildLearningPlan(missingSkills) : [];

  return {
    score: realisticScore,
    matchedSkills,
    missingSkills,
    relatedSkills,
    learningPlan,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    related_skills: relatedSkills,
    learning_plan: learningPlan,
    suggestions,
    breakdown: {
      core: coreScore,
      tools: toolsScore,
      experience: expScore,
    },
  };
}
