import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const counts = await Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      total: 0,
      applied: 0,
      assessments: 0,
      interviews: 0,
      offers: 0,
      rejections: 0,
      wishlist: 0,
      withdrawn: 0,
    };

    counts.forEach((item) => {
      summary.total += item.count;
      if (item._id === 'Applied') summary.applied = item.count;
      else if (item._id === 'Assessment') summary.assessments = item.count;
      else if (item._id === 'Interview') summary.interviews = item.count;
      else if (item._id === 'Offer') summary.offers = item.count;
      else if (item._id === 'Rejected') summary.rejections = item.count;
      else if (item._id === 'Wishlist') summary.wishlist = item.count;
      else if (item._id === 'Withdrawn') summary.withdrawn = item.count;
    });

    // Count distinct total interviews conducted/scheduled
    const totalInterviewsCount = await Interview.countDocuments({ userId });

    // Funnel & conversion rates
    const eligibleForResponse = summary.total - summary.wishlist;
    const responseCount = summary.assessments + summary.interviews + summary.offers + summary.rejections;
    const responseRate = eligibleForResponse > 0 ? Math.round((responseCount / eligibleForResponse) * 100) : 0;
    const interviewRate = eligibleForResponse > 0 ? Math.round(((summary.interviews + summary.offers) / eligibleForResponse) * 100) : 0;
    const offerRate = eligibleForResponse > 0 ? Math.round((summary.offers / eligibleForResponse) * 100) : 0;

    return sendSuccess(res, 200, 'Dashboard summary retrieved successfully.', {
      summary,
      totalInterviews: totalInterviewsCount,
      metrics: {
        responseRate,
        interviewRate,
        offerRate,
      },
      funnel: [
        { stage: 'Applied', count: summary.applied + summary.assessments + summary.interviews + summary.offers + summary.rejections },
        { stage: 'Assessment', count: summary.assessments + summary.interviews + summary.offers },
        { stage: 'Interview', count: summary.interviews + summary.offers },
        { stage: 'Offer', count: summary.offers },
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentApplications = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const applications = await Application.find({ userId })
      .sort({ applicationDate: -1, createdAt: -1 })
      .limit(5)
      .lean();

    const appIds = applications.map((a) => a._id);
    const now = new Date();
    const upcomingInterviews = await Interview.find({
      userId,
      applicationId: { $in: appIds },
      scheduledAt: { $gte: now },
      outcome: 'Pending',
    })
      .sort({ scheduledAt: 1 })
      .lean();

    const interviewMap = {};
    for (const interview of upcomingInterviews) {
      const appIdStr = interview.applicationId.toString();
      if (!interviewMap[appIdStr]) {
        interviewMap[appIdStr] = interview;
      }
    }

    const result = applications.map((app) => ({
      ...app,
      nextInterview: interviewMap[app._id.toString()] || null,
    }));

    return sendSuccess(res, 200, 'Recent applications retrieved successfully.', result);
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
      .limit(5)
      .lean();

    return sendSuccess(res, 200, 'Upcoming interviews retrieved successfully.', interviews);
  } catch (error) {
    next(error);
  }
};

export const getApplicationTrends = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Group applications by month
    const trends = await Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$applicationDate' },
          },
          count: { $sum: 1 },
          offers: {
            $sum: { $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0] },
          },
          interviews: {
            $sum: { $cond: [{ $in: ['$status', ['Interview', 'Offer']] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          period: '$_id',
          count: 1,
          offers: 1,
          interviews: 1,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Application trends retrieved successfully.', trends);
  } catch (error) {
    next(error);
  }
};

export const getStatusDistribution = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const distribution = await Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Status distribution retrieved successfully.', distribution);
  } catch (error) {
    next(error);
  }
};

export const getSourceDistribution = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const sources = await Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          source: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, 200, 'Source distribution retrieved successfully.', sources);
  } catch (error) {
    next(error);
  }
};
