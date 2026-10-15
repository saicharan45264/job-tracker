import { Router } from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  updateInterviewOutcome,
  deleteInterview,
  getUpcomingInterviews,
  getCalendarInterviews,
} from '../controllers/interview.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import {
  createInterviewSchema,
  updateInterviewSchema,
  updateOutcomeSchema,
} from '../validators/interview.validator.js';

const router = Router();

router.use(authenticate);

// Specific routes before :id
router.get('/upcoming', getUpcomingInterviews);
router.get('/calendar', getCalendarInterviews);

router.post('/', validate(createInterviewSchema), createInterview);
router.get('/', getInterviews);

router.get('/:id', validateObjectId('id'), getInterviewById);
router.put('/:id', validateObjectId('id'), validate(updateInterviewSchema), updateInterview);
router.patch('/:id/outcome', validateObjectId('id'), validate(updateOutcomeSchema), updateInterviewOutcome);
router.delete('/:id', validateObjectId('id'), deleteInterview);

export default router;
