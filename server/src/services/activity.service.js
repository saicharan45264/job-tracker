import { Activity } from '../models/Activity.js';

export const logActivity = async ({ userId, applicationId, type, message, metadata = {} }) => {
  try {
    const activity = await Activity.create({
      userId,
      applicationId,
      type,
      message,
      metadata,
    });
    return activity;
  } catch (err) {
    console.error('[Activity Service] Error creating activity record:', err.message);
    return null;
  }
};
