import { z } from 'zod';
import { INTERVIEW_TYPES, INTERVIEW_MODES, INTERVIEW_OUTCOMES } from '../models/Interview.js';

export const createInterviewSchema = z.object({
  applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Application ID'),
  round: z.string().min(1, 'Round is required').max(100),
  type: z.enum(INTERVIEW_TYPES).optional().default('Technical Interview'),
  scheduledAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format')),
  timeZone: z.string().optional().default('UTC'),
  durationMinutes: z.number().int().min(5).max(480).optional().default(45),
  mode: z.enum(INTERVIEW_MODES).optional().default('Online'),
  meetingLink: z.string().url('Invalid URL format').optional().or(z.literal('')).default(''),
  location: z.string().optional().default(''),
  interviewers: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
  preparationChecklist: z
    .array(
      z.object({
        item: z.string().min(1, 'Checklist item cannot be empty'),
        completed: z.boolean().optional().default(false),
      })
    )
    .optional()
    .default([]),
  outcome: z.enum(INTERVIEW_OUTCOMES).optional().default('Pending'),
  feedback: z.string().optional().default(''),
});

export const updateInterviewSchema = createInterviewSchema.partial();

export const updateOutcomeSchema = z.object({
  outcome: z.enum(INTERVIEW_OUTCOMES),
  feedback: z.string().optional().default(''),
});
