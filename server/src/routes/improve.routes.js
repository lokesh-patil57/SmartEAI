import { Router } from 'express';
import { postImprove, postImproveSection, postRestructure, postDetectTone, postDraftCoverLetter, postDraftColdMail } from '../controllers/improve.controller.js';
import { validate, improveSchema, improveSectionSchema } from '../utils/validation.js';

const router = Router();
router.post('/', validate(improveSchema), postImprove);
router.post('/section', validate(improveSectionSchema), postImproveSection);
router.post('/restructure', postRestructure);
router.post('/detect-tone', postDetectTone);
router.post('/draft-cover-letter', postDraftCoverLetter);
router.post('/draft-cold-mail', postDraftColdMail);
// router.post('/format', postFormat);
export default router;
