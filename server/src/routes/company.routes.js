import { Router } from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyApplications,
} from '../controllers/company.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import { createCompanySchema, updateCompanySchema } from '../validators/company.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCompanySchema), createCompany);
router.get('/', getCompanies);

router.get('/:id', validateObjectId('id'), getCompanyById);
router.put('/:id', validateObjectId('id'), validate(updateCompanySchema), updateCompany);
router.delete('/:id', validateObjectId('id'), deleteCompany);
router.get('/:id/applications', validateObjectId('id'), getCompanyApplications);

export default router;
