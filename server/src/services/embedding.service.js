import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
const embeddingCache = new Map();

function normalizeKey(text = '') {
  return String(text).toLowerCase().replace(/\s+/g, ' ').trim();
}

function hashToUnitFloat(input) {
  const hash = crypto.createHash('sha256').update(input).digest();
  const value = hash.readUInt32BE(0);
  return value / 0xffffffff;
}

function fallbackEmbedding(text = '', dimensions = 64) {
  const normalized = normalizeKey(text) || 'empty';
  const vector = [];
  for (let index = 0; index < dimensions; index += 1) {
    vector.push(hashToUnitFloat(`${normalized}:${index}`));
  }
  return vector;
}

function normalizeEmbedding(vector) {
  if (!Array.isArray(vector)) return [];
  return vector.map((value) => Number(value) || 0);
}

export async function generateEmbedding(text = '') {
  const normalized = normalizeKey(text);
  if (!normalized) return [];

  if (embeddingCache.has(normalized)) {
    return embeddingCache.get(normalized);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const fallback = fallbackEmbedding(normalized);
    embeddingCache.set(normalized, fallback);
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const response = await model.embedContent({
      content: { role: 'user', parts: [{ text: normalized }] },
      taskType: 'RETRIEVAL_DOCUMENT',
      title: 'smarteai-skill-embedding',
    });

    const vector = normalizeEmbedding(response?.embedding?.values || []);
    const finalVector = vector.length ? vector : fallbackEmbedding(normalized);
    embeddingCache.set(normalized, finalVector);
    return finalVector;
  } catch {
    const fallback = fallbackEmbedding(normalized);
    embeddingCache.set(normalized, fallback);
    return fallback;
  }
}

export function clearEmbeddingCache() {
  embeddingCache.clear();
}
