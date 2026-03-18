import { Router } from 'express';
import {
  postJobParse,
  postJobAnalyze,
  postJobMatch,
  getJobHistory,
} from '../controllers/job.controller.js';
import { validate, jobParseSchema, jobAnalyzeSchema } from '../utils/validation.js';
import { optionalAuth, protect } from '../middleware/auth.js';

const router = Router();

router.use(optionalAuth);
router.post('/parse', validate(jobParseSchema), postJobParse);
router.post('/analyze', validate(jobAnalyzeSchema), postJobAnalyze);
router.post('/match', validate(jobAnalyzeSchema), postJobMatch);
router.get('/history', protect, getJobHistory);

export default router;
