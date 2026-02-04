import { Router } from 'express';
import { postMatch } from '../controllers/match.controller.js';
import { validate, matchSchema } from '../utils/validation.js';

const router = Router();
router.post('/', validate(matchSchema), postMatch);
export default router;
