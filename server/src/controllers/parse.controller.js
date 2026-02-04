import { extractResumeText, isAllowedMimetype, isAllowedFilename } from '../services/parseResume.service.js';

export async function parseResumeFile(req, res, next) {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mimetype = file.mimetype || '';
    const name = file.originalname || '';

    if (!isAllowedMimetype(mimetype) && !isAllowedFilename(name)) {
      return res.status(400).json({
        error: 'Unsupported file type. Use PDF, DOCX, DOC, or TXT.',
      });
    }

    const text = await extractResumeText(file.buffer, mimetype, name);
    res.json({ text });
  } catch (err) {
    if (err.message?.includes('Unsupported') || err.message?.includes('too large')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}
