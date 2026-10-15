import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

// Specific routes before :id
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);

router.get('/', getNotifications);
router.patch('/:id/read', validateObjectId('id'), markAsRead);
router.delete('/:id', validateObjectId('id'), deleteNotification);

export default router;
