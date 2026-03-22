import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplicationStatus,
  exportApplicationsCsv,
  getApplicationsByRole,
} from '../controllers/application.controller.js';

const router = Router();

// All application routes require authentication
router.use(protect);

router.post('/create', createApplication);
router.get('/user', getUserApplications);
router.get('/export/csv', exportApplicationsCsv);   // must be before /:id
router.get('/by-role', getApplicationsByRole);       // must be before /:id
router.get('/:id', getApplicationById);
router.patch('/status', updateApplicationStatus);

export default router;
