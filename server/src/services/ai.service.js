/**
 * AI Content Improvement - Gemini (preferred) or OpenAI.
 * Rules: rewrite only from existing information; never add fake skills; use "exposure"/"familiarity" for missing.
 */

const IMPROVE_SYSTEM = `You are an ethical resume and application content editor for SmartEAI.

STRICT RULES:
1. Rewrite ONLY using information that is already present in the user's content. Do not invent skills, job titles, companies, or experiences.
2. Improve clarity, professional wording, and ATS-friendly language. Preserve the document structure (sections, bullets, paragraphs).
3. If the user or job description mentions a skill the content does not clearly show, you may rephrase existing points to use terms like "exposure to", "familiarity with", or "interest in" only when the content supports that. Never claim direct experience the user did not provide.
4. Do not add bullet points or sentences that describe experience the user did not write.
5. Output only the improved text, no meta-commentary or explanations.`;

const IMPROVE_SECTION_SYSTEM = `You are an expert career coach and professional resume editor.

YOUR GOAL: Make this resume "upload-ready" for the specific Job Description provided.

RULES:
1.  **Gap Filling**: If the Job Description requires a skill (e.g., "Docker", "AWS") that is missing from the resume, PROACTIVELY ADD IT.
    - If it fits in "Skills", add it.
    - If it's a major requirement, draft a short, realistic bullet point in "Experience" or "Projects" using phrasing like "Familiarity with...", "Academic exposure to...", or "Implemented basic..." to keep it truthful but matching.
2.  **Optimize Wording**: Rewrite existing bullet points to use keywords from the Job Description.
3.  **Full Document Return**: You will receive the full document. You must return the COMPLETE document.
    - The section you are improving must be rewritten.
    - The rest of the document must remain UNTOUCHED.
4.  **Output**: Return ONLY the full updated text. No explanations.`;

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  return import('@google/generative-ai').then(({ GoogleGenerativeAI }) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: DEFAULT_GEMINI_MODEL });
  });
}

function extractGeminiText(result) {
  const response = result?.response;
  const text = typeof response?.text === 'function' ? response.text() : '';
  if (!text || typeof text !== 'string') {
    throw new Error('Gemini returned no text');
  }
  return text.trim();
}

export async function callGeminiText({ systemPrompt = '', userPrompt = '', prompt = '' }) {
  const model = await getGeminiModel();
  const finalPrompt = prompt || [systemPrompt, userPrompt].filter(Boolean).join('\n\n');
  const result = await model.generateContent(finalPrompt);
  return extractGeminiText(result);
}

export function parseJsonFromAiText(text, fallback = {}) {
  if (!text || typeof text !== 'string') return fallback;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] || text;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

async function callGemini(content, job, suggestions, mode) {
  const userPrompt = `Mode: ${mode || 'resume'}\n\nJob context (use only to align wording, do not add job-specific lies):\n${job || 'None'}\n\nActionable suggestions to consider (do not invent facts):\n${(suggestions || []).join('\n') || 'None'}\n\nContent to improve (rewrite using ONLY this information):\n\n${content}`;

  try {
    return await callGeminiText({ systemPrompt: IMPROVE_SYSTEM, userPrompt });
  } catch (err) {
    if (err.message.includes('503') || err.message.includes('overloaded')) {
      console.warn('Gemini overloaded, falling back to mock.');
      return mockImprove(content);
    }
    // Use the helper to extract retryAfter if it's a 429
    handleGeminiError(err);
    throw err;
  }
}

async function callGeminiSection(sectionText, job, improvements, mode, sectionName) {
  const userPrompt = `Mode: ${mode || 'resume'}\n\nSection to Improve: ${sectionName || 'Unknown'}\n\nFULL Original Resume:\n${sectionText}\n\nJob Description:\n${job || 'None'}\n\nATS Improvements to incorporate:\n- ${(improvements || []).join('\n- ') || 'None'}\n\nEditing Goal:\nImprove the '${sectionName}' section to better match the job while following the rules.\nRETURN THE FULL RESUME with the improvements applied to that section.`;

  try {
    return await callGeminiText({ systemPrompt: IMPROVE_SECTION_SYSTEM, userPrompt });
  } catch (err) {
    if (err.status === 429 || err.message?.includes('429')) {
      const e = new Error("Gemini API Rate Limit Exceeded. Please wait a moment.");
      e.status = 429;
      throw e;
    }
    if (err.message.includes('503') || err.message.includes('overloaded')) {
      console.warn('Gemini overloaded, falling back to mock.');
      return mockImprove(sectionText, sectionName);
    }
    throw err;
  }
}

async function callOpenAI(content, job, suggestions, mode) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const userMessage = `Mode: ${mode || 'resume'}\n\nJob context (use only to align wording):\n${job || 'None'}\n\nSuggestions (do not invent facts):\n${(suggestions || []).join('\n') || 'None'}\n\nContent to improve (rewrite using ONLY this information):\n\n${content}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: IMPROVE_SYSTEM },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned no content');
  return text.trim();
}

async function callOpenAISection(sectionText, job, improvements, mode, sectionName) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const userMessage = `Mode: ${mode || 'resume'}\n\nSection to Improve: ${sectionName || 'Unknown'}\n\nFULL Original Resume:\n${sectionText}\n\nJob Description:\n${job || 'None'}\n\nATS Improvements:\n- ${(improvements || []).join('\n- ') || 'None'}\n\nEditing Goal:\nImprove the '${sectionName}' section to better match the job while following the rules.\nRETURN THE FULL RESUME with the improvements applied to that section.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: IMPROVE_SECTION_SYSTEM },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned no content');
  return text.trim();
}

export async function draftColdMail(resume, context, recipientType = 'Recruiter', role = 'Role', company = 'Company') {
  const prompt = `
    You are an expert cold-email copywriter.
    
    GOAL: Write a high-converting cold email to a ${recipientType} at "${company}" for the role of "${role}".
    
    STRICT REQUIREMENTS:
    1. Length: MUST be between 100–115 words.
    2. Tone: Clear, confident, professional.
    3. NO Clichés: Avoid "I hope you're doing well", "My name is", etc. Start directly.
    4. Structure:
       - Subject Line: Concise (4-7 words).
       - Paragraph 1: Who you are + Core Skill/Role.
       - Paragraph 2: 2-3 Concrete skills/projects from Resume as proof. Show relevance to company.
       - Paragraph 3: Low-pressure CTA (yes/no question or short call).
    5. Formatting: Short paragraphs (2-3 lines max).
    
    RESUME CONTENT:
    ${resume}
    
    JOB/CONTEXT:
    ${context}
    
    OUTPUT FORMAT:
    Subject: [Subject Line]
    
    [Email Body]
  `;

  try {
    return await callGeminiText({ prompt });
  } catch (error) {
    if (error.status === 429 || error.message?.includes('429')) {
      const e = new Error("Gemini API Rate Limit Exceeded. Please wait a moment.");
      e.status = 429;
      throw e;
    }
    handleGeminiError(error);
    return "Subject: Interest in Role\n\nCould not generate email.";
  }
}

export async function restructureContent(content) {
  const prompt = `
    You are an expert Resume Writer and ATS (Applicant Tracking System) Specialist.
    Your task is to RESTRUCTURE and REWRITE the provided resume content into a highly professional, ATS-friendly format.

    RULES:
    1. Organize into these standard sections in order: 
       - CONTACT INFO (Name, Email, Phone, Links only)
       - PROFESSIONAL SUMMARY (Concise, impactful, 3-4 lines)
       - SKILLS (Grouped logically, e.g., Languages, Tools, Frameworks)
       - EXPERIENCE (Reverse chronological, use strong action verbs, quantify results)
       - PROJECTS (Name, Tech Stack, Description with bullets)
       - EDUCATION (Degree, University, Year)
    2. Do NOT invent information. Only use what is provided.
    3. Improve clarity, grammar, and impact of bullet points.
    4. Remove clutter, conversational tone, or first-person pronouns (I, me, my).
    5. Return ONLY the plain text of the new resume. Do not use Markdown formatting (bold/italics) inside the text unless necessary for headers, but keep it clean.
    
    ORIGINAL CONTENT:
    ${content}
  `;

  try {
    return await callGeminiText({ prompt });
  } catch (error) {
    if (error.status === 503 || error.message?.includes('503')) {
      console.warn('Gemini Overloaded (503), returning original content with warning.');
      return "Service overloaded. Please try again later.\n\n" + content;
    }
    if (error.status === 429 || error.message?.includes('429')) {
      console.warn('Gemini Rate Limit (429), returning original content with warning.');
      return "⚠️ API Rate Limit Exceeded (Google Gemini Free Tier).\nPlease wait about 60 seconds and try again.\n\n" + content;
    }
    throw error;
  }
}

/* ================= COVER LETTER SERVICES ================= */

export async function detectTone(jobDescription) {
  const prompt = `
    Analyze the TONE of this job description.
    Classify it into EXACTLY ONE of these categories:
    - Formal (Corporate, banking, legal, traditional)
    - Startup (Energetic, "hustle", "rockstar", fast-paced)
    - Friendly (Warm, human-centric, collaborative, inclusive)
    - Technical (Precise, no-fluff, skills-focused, engineering-heavy)

    JOB DESCRIPTION:
    ${jobDescription.substring(0, 5000)}

    OUTPUT FORMAT:
    Just return the category name (e.g., "Formal"). No other text.
  `;

  try {
    const text = await callGeminiText({ prompt });
    // Fallback normalization
    if (text.toLowerCase().includes('formal')) return 'Formal';
    if (text.toLowerCase().includes('startup')) return 'Startup';
    if (text.toLowerCase().includes('friendly')) return 'Friendly';
    if (text.toLowerCase().includes('technical')) return 'Technical';
    return 'Formal';
  } catch (error) {
    // For tone detection, we can silently fail back to 'Formal'
    console.warn("Tone detection failed:", error.message);
    return 'Formal';
  }
}

export async function draftCoverLetter(resume, job, tone = 'Formal', role = 'Applicant', company = 'Hiring Team') {
  const toneInstructions = {
    'Formal': 'Use professional, respectful, and structured language. Avoid slang. Focus on reliability.',
    'Startup': 'Be energetic, proactive, and show passion. Use brighter, punchier sentences.',
    'Friendly': 'Be warm, personable, and collaborative. Focus on culture fit and team spirit.',
    'Technical': 'Be precise, direct, and efficient. Focus on technical competence and problem-solving.'
  };

  const prompt = `
    You are an expert career coach writing a Cover Letter.
    
    GOAL: Write a customized cover letter for the role of "${role}" at "${company}".
    
    TONE: ${tone}
    Tone Instruction: ${toneInstructions[tone] || toneInstructions['Formal']}

    RESUME CONTENT (FACTS ONLY - DO NOT INVENT):
    ${resume}

    JOB DESCRIPTION (CONTEXT):
    ${job}

    STRUCTURE:
    1. Opening: Strong hook, mentions role and company, expresses interest.
    2. Skills Alignment: Connect 2-3 key skills from resume to the job requirements.
    3. Motivation: Why this specific company/role? (Infer from job description context).
    4. Closing: Professional call to action.

    CRITICAL RULES:
    1. DO NOT invent ANY experience, skills, or degrees not found in the REUSME CONTENT.
    2. If a skill mentioned in JOB is missing in RESUME, you may say "I am eager to apply my background in X to learn Y", but do NOT say you know Y.
    3. Keep it under 400 words.
    4. Return ONLY the body text. No "Subject:" line, no placeholders like [Your Name] unless necessary.
  `;

  try {
    return await callGeminiText({ prompt });
  } catch (error) {
    if (error.status === 429 || error.message?.includes('429')) {
      const e = new Error("Gemini API Rate Limit Exceeded. Please wait a moment.");
      e.status = 429;
      throw e;
    }
    handleGeminiError(error);
    return "Could not generate cover letter at this time.";
  }
}

function handleGeminiError(error) {
  if (error.status === 503 || error.message?.includes('503')) {
    console.warn('Gemini Overloaded (503)');
  } else if (error.status === 429 || error.message?.includes('429')) {
    console.warn('Gemini Rate Limit (429)');

    // Attempt to extract wait time
    let waitTime = 60; // Default
    if (error.errorDetails) {
      const retryInfo = error.errorDetails.find(d => d['@type']?.includes('RetryInfo'));
      if (retryInfo && retryInfo.retryDelay) {
        // Format is often "10.3s" or just "10s"
        const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
        if (!isNaN(seconds)) waitTime = Math.ceil(seconds);
      }
    }

    const e = new Error(`Gemini Rate Limit Exceeded. Please wait ${waitTime}s.`);
    e.status = 429;
    e.retryAfter = waitTime;
    throw e;
  }
}

function mockImprove(content, sectionName) {
  // ... existing mock ...

  if (!content) return "Mock improved content.";

  const newSkill = "Top-tier Skill (Mock Added)";
  const newProject = "• Analyzed large datasets using Python and AWS (Mock Added Project)";

  if (sectionName === "Skills" || content.includes("Skills")) {
    return content.replace(/Skills:?/, `Skills: ${newSkill}, `) + `\n\n[Mock AI: Added '${newSkill}' to match job]`;
  }

  if (sectionName === "Projects" || sectionName === "Experience") {
    // Naive insert
    return content + `\n${newProject}\n[Mock AI: Added project to match job requirements]`;
  }

  return content.replace(sectionName, `${sectionName} (optimized for Job Match)`) + "\n[Mock AI: Improved wording]";
}

/**
 * Improve content using AI. Uses Gemini if GEMINI_API_KEY is set, else OpenAI.
 */
export async function improveContent({ content, job = '', suggestions = [], mode = 'resume' }) {
  if (!content || typeof content !== 'string') throw new Error('content is required');
  if (process.env.GEMINI_API_KEY) return callGemini(content, job, suggestions, mode);
  if (process.env.OPENAI_API_KEY) return callOpenAI(content, job, suggestions, mode);

  console.warn("No API Keys set. Using Mock AI.");
  return mockImprove(content);
}

/**
 * Improve a single section using AI. Output must be ONLY the rewritten section.
 */
export async function improveSection({
  sectionText,
  job = '',
  improvements = [],
  mode = 'resume',
  sectionName = '',
}) {
  if (!sectionText || typeof sectionText !== 'string') throw new Error('sectionText is required');
  if (process.env.GEMINI_API_KEY) return callGeminiSection(sectionText, job, improvements, mode, sectionName);
  if (process.env.OPENAI_API_KEY) return callOpenAISection(sectionText, job, improvements, mode, sectionName);

  console.warn("No API Keys set. Using Mock AI.");
  return mockImprove(sectionText, sectionName);
}
