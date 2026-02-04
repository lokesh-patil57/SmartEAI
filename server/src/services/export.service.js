/**
 * Content export: PDF (pdfkit), DOCX (docx), TXT (plain text).
 */

import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export function exportTxt(content) {
  return Buffer.from(content || '', 'utf8');
}

export function exportPdf(content) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const text = (content || '').trim() || 'No content to export.';

    // Use PDFKit's native text wrapping and layout engine
    doc.font('Helvetica').fontSize(11).text(text, {
      align: 'left',
      width: 500,
      lineGap: 4,
      paragraphGap: 8
    });

    doc.end();
  });
}

export async function exportDocx(content) {
  const text = (content || '').trim() || 'No content to export.';
  const paragraphs = text.split(/\r?\n/).map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line || ' ', break: 1 })],
        spacing: { after: 100 },
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length ? paragraphs : [new Paragraph({ children: [new TextRun('No content.')] })],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
