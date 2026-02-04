import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
  'text/csv',
];

/**
 * Extract text from a resume file buffer.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - MIME type
 * @param {string} [originalname] - Original filename (fallback for extension)
 * @returns {Promise<string>} Extracted text
 */
export async function extractResumeText(buffer, mimetype, originalname = '') {
  if (buffer.length > MAX_SIZE) {
    throw new Error('File too large (max 10 MB)');
  }

  const ext = (originalname.split('.').pop() || '').toLowerCase();

  // PDF
  if (mimetype === 'application/pdf' || ext === 'pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      await parser.destroy();
      return (result?.text || '').trim();
    } finally {
      try {
        await parser.destroy();
      } catch (_) {}
    }
  }

  // DOCX / DOC
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === 'docx' ||
    ext === 'doc'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return (result?.value || '').trim();
  }

  // Plain text
  if (mimetype === 'text/plain' || mimetype === 'text/csv' || ext === 'txt' || ext === 'csv') {
    return buffer.toString('utf-8').trim();
  }

  throw new Error('Unsupported file type. Use PDF, DOCX, DOC, or TXT.');
}

export function isAllowedMimetype(mimetype) {
  return ALLOWED_TYPES.includes(mimetype);
}

export function isAllowedFilename(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return ['pdf', 'docx', 'doc', 'txt', 'csv'].includes(ext);
}
