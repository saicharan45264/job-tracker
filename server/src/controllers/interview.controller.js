import mongoose from 'mongoose';
import { Interview } from '../models/Interview.js';
import { Application } from '../models/Application.js';
import { logActivity } from '../services/activity.service.js';
import { createNotification } from '../services/notification.service.js';
import { sendSuccess, sendPaginated, sendError } from '../utils/apiResponse.js';

export const createInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { applicationId, ...rest } = req.body;

    // Verify application belongs to user
    const application = await Application.findOne({ _id: applicationId, userId });
    if (!application) {
      return sendError(res, 404, 'Associated job application not found or does not belong to you.');
    }

    const interview = await Interview.create({
      userId,
      applicationId,
      ...rest,
    });

    // Auto-advance application status if it was Wishlist or Applied
    if (['Wishlist', 'Applied'].includes(application.status)) {
      application.status = 'Interview';
      await application.save();

      await logActivity({
        userId,
        applicationId,
        type: 'STATUS_CHANGED',
        message: `Status automatically moved to Interview upon scheduling ${interview.round}`,
        metadata: { previousStatus: application.status, newStatus: 'Interview' },
      });
    }

    // Log activity
    await logActivity({
      userId,
      applicationId,
      type: 'INTERVIEW_SCHEDULED',
      message: `Scheduled ${interview.round} (${interview.type}) for ${new Date(interview.scheduledAt).toLocaleString()}`,
      metadata: { interviewId: interview._id, round: interview.round, scheduledAt: interview.scheduledAt },
    });

    // Create notification
    await createNotification({
      userId,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: `Scheduled ${interview.round} with ${application.company} on ${new Date(interview.scheduledAt).toLocaleDateString()}.`,
      applicationId,
    });

    const populatedInterview = await Interview.findById(interview._id)
      .populate('applicationId', 'company jobTitle status priority')
      .lean();

    return sendSuccess(res, 201, 'Interview scheduled successfully.', populatedInterview);
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      startDate,
      endDate,
      outcome,
      type,
      mode,
      applicationId,
      sortBy = 'scheduledAt',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { userId: new mongoose.Types.ObjectId(userId) };

    if (applicationId) filter.applicationId = new mongoose.Types.ObjectId(applicationId);
    if (outcome) filter.outcome = outcome;
    if (type) filter.type = type;
    if (mode) filter.mode = mode;

    if (startDate || endDate) {
      filter.scheduledAt = {};
      if (startDate) filter.scheduledAt.$gte = new Date(startDate);
      if (endDate) filter.scheduledAt.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate('applicationId', 'company jobTitle status priority')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Interview.countDocuments(filter),
    ]);

    return sendPaginated(res, 200, 'Interviews retrieved successfully.', interviews, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOne({ _id: id, userId })
      .populate('applicationId', 'company jobTitle status priority companyWebsite jobUrl')
      .lean();

    if (!interview) {
      return sendError(res, 404, 'Interview not found.');
    }

    return sendSuccess(res, 200, 'Interview retrieved successfully.', interview);
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingInterview = await Interview.findOne({ _id: id, userId });
    if (!existingInterview) {
      return sendError(res, 404, 'Interview not found.');
    }

    const updated = await Interview.findOneAndUpdate({ _id: id, userId }, req.body, {
      new: true,
      runValidators: true,
    }).populate('applicationId', 'company jobTitle status priority');

    await logActivity({
      userId,
      applicationId: updated.applicationId._id || updated.applicationId,
      type: 'INTERVIEW_RESCHEDULED',
      message: `Updated interview details for ${updated.round}`,
      metadata: { round: updated.round, scheduledAt: updated.scheduledAt },
    });

    return sendSuccess(res, 200, 'Interview updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

export const updateInterviewOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { outcome, feedback } = req.body;

    const interview = await Interview.findOne({ _id: id, userId }).populate(
      'applicationId',
      'company jobTitle status'
    );
    if (!interview) {
      return sendError(res, 404, 'Interview not found.');
    }

    interview.outcome = outcome;
    if (feedback !== undefined) interview.feedback = feedback;
    await interview.save();

    const activityType = outcome === 'Cancelled' ? 'INTERVIEW_CANCELLED' : 'INTERVIEW_COMPLETED';

    await logActivity({
      userId,
      applicationId: interview.applicationId._id,
      type: activityType,
      message: `Interview ${interview.round} marked as ${outcome}${feedback ? ` (${feedback})` : ''}`,
      metadata: { round: interview.round, outcome, feedback },
    });

    return sendSuccess(res, 200, 'Interview outcome updated successfully.', interview);
  } catch (error) {
    next(error);
  }
};

export const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOneAndDelete({ _id: id, userId });
    if (!interview) {
      return sendError(res, 404, 'Interview not found.');
    }

    return sendSuccess(res, 200, 'Interview deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const getUpcomingInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const interviews = await Interview.find({
      userId,
      scheduledAt: { $gte: now },
      outcome: 'Pending',
    })
      .populate('applicationId', 'company jobTitle status priority')
      .sort({ scheduledAt: 1 })
      .limit(10)
      .lean();

    return sendSuccess(res, 200, 'Upcoming interviews retrieved successfully.', interviews);
  } catch (error) {
    next(error);
  }
};

export const getCalendarInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, year, startDate, endDate } = req.query;

    const filter = { userId: new mongoose.Types.ObjectId(userId) };

    if (startDate && endDate) {
      filter.scheduledAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (month && year) {
      const start = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const end = new Date(parseInt(year, 10), parseInt(month, 10), 0, 23, 59, 59, 999);
      filter.scheduledAt = { $gte: start, $lte: end };
    }

    const interviews = await Interview.find(filter)
      .populate('applicationId', 'company jobTitle status priority')
      .sort({ scheduledAt: 1 })
      .lean();

    return sendSuccess(res, 200, 'Calendar interviews retrieved successfully.', interviews);
  } catch (error) {
    next(error);
  }
};
