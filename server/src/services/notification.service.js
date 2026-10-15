import { Notification } from '../models/Notification.js';

export const createNotification = async ({ userId, type = 'GENERAL', title, message, applicationId = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      applicationId,
      isRead: false,
    });
    return notification;
  } catch (err) {
    console.error('[Notification Service] Error creating notification:', err.message);
    return null;
  }
};
