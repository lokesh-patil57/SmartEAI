import { generateEmbedding } from './embedding.service.js';
import { searchSimilarVectors } from './vector.service.js';

function normalize(text = '') {
  return String(text).toLowerCase().trim();
}

export async function findRelatedSkills(skill = '', options = {}) {
  const { topK = 5, minSimilarity = 0.35 } = options;
  const normalizedSkill = normalize(skill);
  if (!normalizedSkill) return [];

  const queryEmbedding = await generateEmbedding(skill);
  const nearest = searchSimilarVectors(queryEmbedding, topK + 2, minSimilarity);

  const related = [];
  for (const item of nearest) {
    const candidateSkill = item.metadata?.skill || item.metadata?.name;
    if (!candidateSkill) continue;
    if (normalize(candidateSkill) === normalizedSkill) continue;

    related.push({
      skill: candidateSkill,
      category: item.metadata?.category || 'general',
      score: item.score,
      metadata: item.metadata,
    });

    if (related.length >= topK) break;
  }

  return related;
}
