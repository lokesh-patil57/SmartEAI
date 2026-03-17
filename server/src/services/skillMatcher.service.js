function normalize(value = '') {
  return String(value).toLowerCase().trim();
}

function normalizeSet(list = []) {
  return new Set((list || []).map((item) => normalize(item)).filter(Boolean));
}

export function matchSkills(resumeSkills = [], jobSkills = []) {
  const resumeSet = normalizeSet(resumeSkills);
  const originalJobSkills = (jobSkills || []).map((item) => String(item).trim()).filter(Boolean);
  const jobSet = normalizeSet(originalJobSkills);

  const matchedSkills = [];
  const missingSkills = [];

  for (const jobSkill of originalJobSkills) {
    const normalizedSkill = normalize(jobSkill);
    if (!normalizedSkill) continue;
    if (resumeSet.has(normalizedSkill)) matchedSkills.push(jobSkill);
    else missingSkills.push(jobSkill);
  }

  const totalJobSkills = jobSet.size || 1;
  const matchScore = Math.round((matchedSkills.length / totalJobSkills) * 100);

  const suggestions = missingSkills.map((skill) => `Add evidence of ${skill} via projects, experience bullets, or coursework.`);

  return {
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    matchScore,
    suggestions,
  };
}
