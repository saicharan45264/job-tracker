import { Router } from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
  exportApplications,
} from '../controllers/application.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import {
  createApplicationSchema,
  updateApplicationSchema,
  updateStatusSchema,
  queryApplicationsSchema,
} from '../validators/application.validator.js';

const router = Router();

router.use(authenticate);

// Collection-level routes (must precede /:id)
router.get('/stats', getApplicationStats);
router.get('/export', exportApplications);
router.post('/', validate(createApplicationSchema), createApplication);
router.get('/', validate(queryApplicationsSchema, 'query'), getApplications);

// Resource-level routes
router.get('/:id', validateObjectId('id'), getApplicationById);
router.put('/:id', validateObjectId('id'), validate(updateApplicationSchema), updateApplication);
router.patch('/:id/status', validateObjectId('id'), validate(updateStatusSchema), updateApplicationStatus);
router.delete('/:id', validateObjectId('id'), deleteApplication);

export default router;
