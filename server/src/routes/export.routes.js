import { Router } from 'express';
import { postExportPdf, postExportDocx, postExportTxt } from '../controllers/export.controller.js';
import { validate, exportSchema } from '../utils/validation.js';

const router = Router();
const validateExport = validate(exportSchema);

router.post('/pdf', validateExport, postExportPdf);
router.post('/docx', validateExport, postExportDocx);
router.post('/txt', validateExport, postExportTxt);
export default router;
