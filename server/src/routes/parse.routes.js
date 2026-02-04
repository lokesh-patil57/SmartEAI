import { Router } from 'express';
import multer from 'multer';
import { parseResumeFile } from '../controllers/parse.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post('/resume', upload.single('file'), parseResumeFile);

export default router;
