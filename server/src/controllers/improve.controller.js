import { improveContent, improveSection, restructureContent, detectTone, draftCoverLetter, draftColdMail } from '../services/ai.service.js';

export async function postImprove(req, res, next) {
  try {
    const { content, job = '', suggestions = [], mode = 'resume' } = req.body;
    const improvedContent = await improveContent({ content, job, suggestions, mode });
    res.json({ improved_content: improvedContent });
  } catch (err) {
    next(err);
  }
}

export async function postImproveSection(req, res, next) {
  try {
    const {
      sectionText,
      job = '',
      improvements = [],
      sectionName = '',
      mode = 'resume',
    } = req.body;
    const rewritten = await improveSection({
      sectionText,
      job,
      improvements,
      sectionName,
      mode,
    });
    res.json({ rewritten_section: rewritten });
  } catch (err) {
    next(err);
  }
}
export async function postRestructure(req, res, next) {
  try {
    const { content } = req.body; // Expecting { content: "resume text" }
    const restructured = await restructureContent(content);
    res.json({ restructured_content: restructured });
  } catch (err) {
    next(err);
  }
}


export async function postDetectTone(req, res, next) {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ error: "Job description is required" });
    const tone = await detectTone(jobDescription);
    res.json({ tone });
  } catch (err) {
    next(err);
  }
}

export async function postDraftCoverLetter(req, res, next) {
  try {
    const { resume, job, tone, role, company } = req.body;
    if (!resume || !job) return res.status(400).json({ error: "Resume and Job Description are required" });
    const draft = await draftCoverLetter(resume, job, tone, role, company);
    res.json({ draft });
  } catch (err) {
    next(err);
  }
}

export async function postDraftColdMail(req, res, next) {
  try {
    const { resume, context, recipientType, role, company } = req.body;
    if (!resume) return res.status(400).json({ error: "Resume content is required" });
    const draft = await draftColdMail(resume, context, recipientType, role, company);
    res.json({ draft });
  } catch (err) {
    next(err);
  }
}
