import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    const matchStage = { userId };
    if (startDate || endDate) {
      matchStage.applicationDate = {};
      if (startDate) matchStage.applicationDate.$gte = new Date(startDate);
      if (endDate) matchStage.applicationDate.$lte = new Date(endDate);
    }

    const [statusCounts, interviewStats, firstInterviewAvg] = await Promise.all([
      Application.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Interview.countDocuments({
        userId,
        ...(startDate || endDate ? { scheduledAt: matchStage.applicationDate } : {}),
      }),
      // Calculate avg time between applicationDate and first interview scheduledAt
      Interview.aggregate([
        { $match: { userId } },
        {
          $lookup: {
            from: 'applications',
            localField: 'applicationId',
            foreignField: '_id',
            as: 'app',
          },
        },
        { $unwind: '$app' },
        {
          $project: {
            diffDays: {
              $divide: [
                { $subtract: ['$scheduledAt', '$app.applicationDate'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        { $match: { diffDays: { $gte: 0 } } },
        {
          $group: {
            _id: null,
            avgDays: { $avg: '$diffDays' },
          },
        },
      ]),
    ]);

    let total = 0;
    let applied = 0;
    let assessments = 0;
    let interviews = 0;
    let offers = 0;
    let rejections = 0;
    let wishlist = 0;
    let withdrawn = 0;

    statusCounts.forEach((s) => {
      total += s.count;
      if (s._id === 'Applied') applied = s.count;
      else if (s._id === 'Assessment') assessments = s.count;
      else if (s._id === 'Interview') interviews = s.count;
      else if (s._id === 'Offer') offers = s.count;
      else if (s._id === 'Rejected') rejections = s.count;
      else if (s._id === 'Wishlist') wishlist = s.count;
      else if (s._id === 'Withdrawn') withdrawn = s.count;
    });

    const awaitingDecision = applied + assessments + interviews;
    const activeCohort = total - wishlist;
    const interviewRate = activeCohort > 0 ? Number((((interviews + offers) / activeCohort) * 100).toFixed(1)) : 0;
    const offerRate = activeCohort > 0 ? Number(((offers / activeCohort) * 100).toFixed(1)) : 0;
    const avgDaysToInterview = firstInterviewAvg.length > 0 ? Number(firstInterviewAvg[0].avgDays.toFixed(1)) : 0;

    return sendSuccess(res, 200, 'Analytics overview retrieved successfully.', {
      totalApplications: total,
      applied,
      assessments,
      interviews,
      offers,
      rejections,
      wishlist,
      withdrawn,
      awaitingDecision,
      interviewsScheduled: interviewStats,
      interviewRate,
      offerRate,
      avgDaysToInterview,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsApplicationTrends = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    const matchStage = { userId };
    if (startDate || endDate) {
      matchStage.applicationDate = {};
      if (startDate) matchStage.applicationDate.$gte = new Date(startDate);
      if (endDate) matchStage.applicationDate.$lte = new Date(endDate);
    }

    const trends = await Application.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$applicationDate' } },
          applications: { $sum: 1 },
          offers: { $sum: { $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0] } },
          interviews: { $sum: { $cond: [{ $in: ['$status', ['Interview', 'Offer']] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          applications: 1,
          offers: 1,
          interviews: 1,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Analytics application trends retrieved successfully.', trends);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsStatusDistribution = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    const matchStage = { userId };
    if (startDate || endDate) {
      matchStage.applicationDate = {};
      if (startDate) matchStage.applicationDate.$gte = new Date(startDate);
      if (endDate) matchStage.applicationDate.$lte = new Date(endDate);
    }

    const distribution = await Application.aggregate([
      { $match: matchStage },
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

    return sendSuccess(res, 200, 'Analytics status distribution retrieved successfully.', distribution);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsSourceEffectiveness = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const sources = await Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
          interviews: {
            $sum: { $cond: [{ $in: ['$status', ['Interview', 'Offer']] }, 1, 0] },
          },
          offers: {
            $sum: { $cond: [{ $eq: ['$status', 'Offer'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          source: '$_id',
          total: 1,
          interviews: 1,
          offers: 1,
          interviewRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$interviews', '$total'] }, 100] }, 1] },
              0,
            ],
          },
          offerRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$offers', '$total'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return sendSuccess(res, 200, 'Source effectiveness retrieved successfully.', sources);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsInterviewPerformance = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [byType, byOutcome] = await Promise.all([
      Interview.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            passed: { $sum: { $cond: [{ $eq: ['$outcome', 'Passed'] }, 1, 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            type: '$_id',
            count: 1,
            passed: 1,
          },
        },
        { $sort: { count: -1 } },
      ]),
      Interview.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$outcome',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            outcome: '$_id',
            count: 1,
          },
        },
      ]),
    ]);

    return sendSuccess(res, 200, 'Interview performance retrieved successfully.', {
      byType,
      byOutcome,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsMonthlyOutcomes = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const outcomes = await Application.aggregate([
      {
        $match: {
          userId,
          status: { $in: ['Offer', 'Rejected'] },
        },
      },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.period',
          offers: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'Offer'] }, '$count', 0] },
          },
          rejections: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'Rejected'] }, '$count', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          offers: 1,
          rejections: 1,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Monthly outcomes retrieved successfully.', outcomes);
  } catch (error) {
    next(error);
  }
};
