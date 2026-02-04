import { exportPdf, exportDocx, exportTxt } from '../services/export.service.js';

export async function postExportPdf(req, res, next) {
  try {
    const buffer = await exportPdf(req.body.content);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="SmartEAI_Content.pdf"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

export async function postExportDocx(req, res, next) {
  try {
    const buffer = await exportDocx(req.body.content);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="SmartEAI_Content.docx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

export async function postExportTxt(req, res, next) {
  try {
    const buffer = exportTxt(req.body.content);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="SmartEAI_Content.txt"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}
