import { z } from 'zod';
import {
  APPLICATION_STATUSES,
  APPLICATION_PRIORITIES,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPES,
  APPLICATION_SOURCES,
} from '../models/Application.js';

export const createApplicationSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(120),
  companyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Company ID').optional().nullable(),
  jobTitle: z.string().min(1, 'Job title is required').max(150),
  jobDescription: z.string().optional().default(''),
  jobUrl: z.string().url('Invalid URL format').optional().or(z.literal('')).default(''),
  companyWebsite: z.string().url('Invalid URL format').optional().or(z.literal('')).default(''),
  location: z.string().optional().default(''),
  workArrangement: z.enum(WORK_ARRANGEMENTS).optional().default('Remote'),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional().default('Full-time'),
  experienceLevel: z.string().optional().default('Entry-level'),
  salaryMin: z.number().min(0, 'Salary cannot be negative').optional().nullable(),
  salaryMax: z.number().min(0, 'Salary cannot be negative').optional().nullable(),
  currency: z.string().max(10).optional().default('USD'),
  source: z.enum(APPLICATION_SOURCES).optional().default('LinkedIn'),
  applicationDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  status: z.enum(APPLICATION_STATUSES).optional().default('Applied'),
  priority: z.enum(APPLICATION_PRIORITIES).optional().default('Medium'),
  recruiterName: z.string().optional().default(''),
  recruiterEmail: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
  recruiterPhone: z.string().optional().default(''),
  resumeVersion: z.string().optional().default('v1.0'),
  coverLetterVersion: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  notes: z.string().optional(),
});

export const queryApplicationsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  workArrangement: z.string().optional(),
  employmentType: z.string().optional(),
  source: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z
    .enum(['applicationDate', 'company', 'jobTitle', 'priority', 'status', 'createdAt', 'updatedAt'])
    .optional()
    .default('applicationDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});
