import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(120),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')).default(''),
  industry: z.string().max(100).optional().default(''),
  location: z.string().max(100).optional().default(''),
  notes: z.string().optional().default(''),
});

export const updateCompanySchema = createCompanySchema.partial();
