const vectorStore = new Map();

function cosineSimilarity(a = [], b = []) {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    magA += a[index] ** 2;
    magB += b[index] ** 2;
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function storeVector(id, embedding, metadata = {}) {
  if (!id || !Array.isArray(embedding)) return;
  vectorStore.set(String(id), {
    id: String(id),
    embedding,
    metadata,
  });
}

export function searchSimilarVectors(queryEmbedding = [], topK = 5, minSimilarity = 0.35) {
  if (!Array.isArray(queryEmbedding) || !queryEmbedding.length) return [];
  const scored = [];
  for (const value of vectorStore.values()) {
    const similarity = cosineSimilarity(queryEmbedding, value.embedding);
    if (similarity >= minSimilarity) {
      scored.push({
        id: value.id,
        score: Number(similarity.toFixed(4)),
        metadata: value.metadata,
      });
    }
  }

  return scored.sort((left, right) => right.score - left.score).slice(0, topK);
}

export function clearVectors() {
  vectorStore.clear();
}

export function getVectorCount() {
  return vectorStore.size;
}

export function searchSimilarSkills(skillOrEmbedding, options = {}) {
  const { topK = 5, minSimilarity = 0.35 } = options;
  if (Array.isArray(skillOrEmbedding)) {
    return searchSimilarVectors(skillOrEmbedding, topK, minSimilarity);
  }
  return [];
}
