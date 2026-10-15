import mongoose from 'mongoose';
import { Activity } from '../models/Activity.js';
import { Application } from '../models/Application.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getApplicationActivities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership of the application
    const application = await Application.findOne({ _id: id, userId });
    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    const activities = await Activity.find({ applicationId: id, userId })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Application activities retrieved successfully.', activities);
  } catch (error) {
    next(error);
  }
};

export const getRecentActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const activities = await Activity.find({ userId })
      .populate('applicationId', 'company jobTitle status priority')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return sendSuccess(res, 200, 'Recent activities retrieved successfully.', activities);
  } catch (error) {
    next(error);
  }
};
