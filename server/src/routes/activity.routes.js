import { Router } from 'express';
import {
  getApplicationActivities,
  getRecentActivities,
} from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/recent', getRecentActivities);
router.get('/:id', validateObjectId('id'), getApplicationActivities);

export default router;
