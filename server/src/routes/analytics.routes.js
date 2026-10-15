import { Router } from 'express';
import {
  getAnalyticsOverview,
  getAnalyticsApplicationTrends,
  getAnalyticsStatusDistribution,
  getAnalyticsSourceEffectiveness,
  getAnalyticsInterviewPerformance,
  getAnalyticsMonthlyOutcomes,
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/overview', getAnalyticsOverview);
router.get('/application-trends', getAnalyticsApplicationTrends);
router.get('/status-distribution', getAnalyticsStatusDistribution);
router.get('/source-effectiveness', getAnalyticsSourceEffectiveness);
router.get('/interview-performance', getAnalyticsInterviewPerformance);
router.get('/monthly-outcomes', getAnalyticsMonthlyOutcomes);

export default router;
