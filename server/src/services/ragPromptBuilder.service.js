export function buildRagPrompt({
  resumeSkills = [],
  jobSkills = [],
  relatedSkills = [],
  missingSkills = [],
  jobDescription = '',
  resumeText = '',
} = {}) {
  const relatedAsText = relatedSkills
    .map((item) => (typeof item === 'string' ? item : `${item.skill} (${item.category || 'general'})`))
    .join(', ');

  return `Context:\nRelevant skills retrieved from knowledge base: ${relatedAsText || 'None'}\n\nUser resume skills:\n${resumeSkills.join(', ') || 'None'}\n\nTarget job skills:\n${jobSkills.join(', ') || 'None'}\n\nMissing skills:\n${missingSkills.join(', ') || 'None'}\n\nJob description:\n${jobDescription || 'None'}\n\nResume content:\n${resumeText || 'None'}\n\nTask:\nAnalyze the skill gap and generate practical, ATS-friendly improvement suggestions.\nReturn strict JSON with exactly these keys:\n- "summary" (string)\n- "suggestions" (array of strings)\n- "quickWins" (array of strings)\nDo NOT use objects inside the arrays. Return only strings.`;
}
