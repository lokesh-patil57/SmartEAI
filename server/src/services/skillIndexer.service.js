import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateEmbedding } from './embedding.service.js';
import { clearVectors, storeVector } from './vector.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILLS_FILE = path.join(__dirname, '..', 'data', 'skills.json');

let initialized = false;

function buildSkillDescription({ skill, aliases = [], category = '' }) {
  const aliasText = aliases.length ? `Aliases: ${aliases.join(', ')}` : 'Aliases: none';
  return `${skill}. Category: ${category}. ${aliasText}.`; 
}

export async function initializeSkillVectors() {
  if (initialized) return { initialized: true, count: 0, source: 'cache' };

  const raw = await fs.readFile(SKILLS_FILE, 'utf8');
  const parsed = JSON.parse(raw);

  clearVectors();
  let count = 0;

  for (const [category, items] of Object.entries(parsed || {})) {
    for (const item of items || []) {
      const skill = String(item.skill || '').trim();
      if (!skill) continue;

      const aliases = Array.isArray(item.aliases)
        ? item.aliases.map((value) => String(value).trim()).filter(Boolean)
        : [];

      const description = buildSkillDescription({ skill, aliases, category });
      const embedding = await generateEmbedding(description);

      storeVector(`skill:${category}:${skill.toLowerCase()}`, embedding, {
        type: 'skill',
        skill,
        aliases,
        category,
        description,
        source: 'skills.json',
      });

      count += 1;
    }
  }

  initialized = true;
  return { initialized: true, count, source: 'skills.json' };
}

export function resetSkillIndexState() {
  initialized = false;
}
