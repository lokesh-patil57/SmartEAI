import { Router } from 'express';
import { signup, login, getMe, updateProfileResume, updateProfile } from '../controllers/auth.controller.js';
import { validate, signupSchema, loginSchema, updateResumeSchema, updateProfileSchema } from '../utils/validation.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.put('/profile/resume', protect, validate(updateResumeSchema), updateProfileResume);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
export default router;
