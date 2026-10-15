import { z } from 'zod';

export const updateSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      defaultView: z.enum(['table', 'kanban']).optional(),
      currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD']).optional(),
      timeZone: z.string().optional(),
      dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
    })
    .optional(),
});
