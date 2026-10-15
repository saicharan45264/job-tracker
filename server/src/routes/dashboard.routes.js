import { Router } from 'express';
import {
  getDashboardSummary,
  getRecentApplications,
  getUpcomingInterviews,
  getApplicationTrends,
  getStatusDistribution,
  getSourceDistribution,
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/recent-applications', getRecentApplications);
router.get('/upcoming-interviews', getUpcomingInterviews);
router.get('/application-trends', getApplicationTrends);
router.get('/status-distribution', getStatusDistribution);
router.get('/source-distribution', getSourceDistribution);

export default router;
