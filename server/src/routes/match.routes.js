import { Router } from 'express';
import {
	postMatch,
	postMatchInsights,
	postMatchLearningPath,
	postMatchRelatedSkills,
} from '../controllers/match.controller.js';
import { validate, matchSchema } from '../utils/validation.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Base analysis: optionalAuth so userId is available for Application tracking
router.post('/', optionalAuth, validate(matchSchema), postMatch);
router.post('/related-skills', validate(matchSchema), postMatchRelatedSkills);
router.post('/learning-path', validate(matchSchema), postMatchLearningPath);
router.post('/insights', validate(matchSchema), postMatchInsights);
export default router;
