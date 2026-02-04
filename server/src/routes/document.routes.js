import { Router } from 'express';
import {
  listDocuments,
  createDocument,
  getDocumentById,
  saveVersion,
} from '../controllers/document.controller.js';
import { validate, documentSchema, versionSchema } from '../utils/validation.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', listDocuments);
router.post('/', validate(documentSchema), createDocument);
router.get('/:id', getDocumentById);
router.post('/:id/versions', validate(versionSchema), saveVersion);
export default router;
