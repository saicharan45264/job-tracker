import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Company } from '../models/Company.js';
import { Interview } from '../models/Interview.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { logActivity } from '../services/activity.service.js';
import { createNotification } from '../services/notification.service.js';
import { generateApplicationsCsv } from '../services/csv.service.js';
import { sendSuccess, sendPaginated, sendError } from '../utils/apiResponse.js';

export const createApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = { ...req.body, userId };

    // Auto-create or link company if not linked
    if (!data.companyId && data.company) {
      let company = await Company.findOne({ userId, name: data.company.trim() });
      if (!company) {
        company = await Company.create({
          userId,
          name: data.company.trim(),
          website: data.companyWebsite || '',
          location: data.location || '',
        });
      }
      data.companyId = company._id;
    }

    const application = await Application.create(data);


    await logActivity({
      userId,
      applicationId: application._id,
      type: 'APPLICATION_CREATED',
      message: `Created application for ${application.jobTitle} at ${application.company}`,
      metadata: { status: application.status, priority: application.priority },
    });


    await createNotification({
      userId,
      type: 'GENERAL',
      title: 'Application Created',
      message: `Successfully tracked application for ${application.jobTitle} at ${application.company}.`,
      applicationId: application._id,
    });

    return sendSuccess(res, 201, 'Application created successfully.', application);
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      search,
      status,
      priority,
      workArrangement,
      employmentType,
      source,
      startDate,
      endDate,
      sortBy = 'applicationDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { userId: new mongoose.Types.ObjectId(userId) };

    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
    }

    if (priority) filter.priority = priority;
    if (workArrangement) filter.workArrangement = workArrangement;
    if (employmentType) filter.employmentType = employmentType;
    if (source) filter.source = source;

    if (startDate || endDate) {
      filter.applicationDate = {};
      if (startDate) filter.applicationDate.$gte = new Date(startDate);
      if (endDate) filter.applicationDate.$lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { company: searchRegex },
        { jobTitle: searchRegex },
        { location: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const validSortFields = [
      'applicationDate',
      'company',
      'jobTitle',
      'priority',
      'status',
      'createdAt',
      'updatedAt',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'applicationDate';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(filter),
    ]);


    // Attach next upcoming interview to each application
    const appIds = applications.map((app) => app._id);
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

    const enhancedApplications = applications.map((app) => ({
      ...app,
      nextInterview: interviewMap[app._id.toString()] || null,
    }));

    return sendPaginated(res, 200, 'Applications retrieved successfully.', enhancedApplications, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await Application.findOne({ _id: id, userId }).populate('companyId').lean();
    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    // Fetch interviews & recent timeline activities
    const [interviews, activities] = await Promise.all([
      Interview.find({ applicationId: id, userId }).sort({ scheduledAt: 1 }).lean(),
      Activity.find({ applicationId: id, userId }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    // Find next upcoming interview
    const now = new Date();
    const nextInterview = interviews.find(
      (i) => new Date(i.scheduledAt) >= now && i.outcome === 'Pending'
    ) || null;

    return sendSuccess(res, 200, 'Application details retrieved successfully.', {
      ...application,
      interviews,
      activities,
      nextInterview,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingApp = await Application.findOne({ _id: id, userId });
    if (!existingApp) {
      return sendError(res, 404, 'Application not found.');
    }

    const previousStatus = existingApp.status;
    const updateData = { ...req.body };

    // If company changed, check/update companyId
    if (updateData.company && updateData.company !== existingApp.company) {
      let company = await Company.findOne({ userId, name: updateData.company.trim() });
      if (!company) {
        company = await Company.create({
          userId,
          name: updateData.company.trim(),
          website: updateData.companyWebsite || '',
          location: updateData.location || '',
        });
      }
      updateData.companyId = company._id;
    }

    const updatedApp = await Application.findOneAndUpdate({ _id: id, userId }, updateData, {
      new: true,
      runValidators: true,
    });

    // Check if status changed
    if (updateData.status && updateData.status !== previousStatus) {
      await logActivity({
        userId,
        applicationId: id,
        type: 'STATUS_CHANGED',
        message: `Status transitioned from ${previousStatus} to ${updateData.status}`,
        metadata: { previousStatus, newStatus: updateData.status },
      });

      await createNotification({
        userId,
        type: 'STATUS_UPDATE',
        title: 'Status Updated',
        message: `${updatedApp.jobTitle} at ${updatedApp.company} moved to ${updateData.status}.`,
        applicationId: id,
      });
    } else {
      await logActivity({
        userId,
        applicationId: id,
        type: 'APPLICATION_UPDATED',
        message: `Updated details for ${updatedApp.jobTitle} at ${updatedApp.company}`,
      });
    }

    return sendSuccess(res, 200, 'Application updated successfully.', updatedApp);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, notes } = req.body;

    const app = await Application.findOne({ _id: id, userId });
    if (!app) {
      return sendError(res, 404, 'Application not found.');
    }

    const previousStatus = app.status;
    app.status = status;
    if (notes) {
      app.notes = app.notes ? `${app.notes}\n[${new Date().toLocaleDateString()} Status Update: ${notes}]` : notes;
    }
    await app.save();

    let activityType = 'STATUS_CHANGED';
    if (status === 'Offer') activityType = 'OFFER_RECEIVED';
    if (status === 'Rejected') activityType = 'APPLICATION_REJECTED';
    if (status === 'Withdrawn') activityType = 'APPLICATION_WITHDRAWN';

    await logActivity({
      userId,
      applicationId: id,
      type: activityType,
      message: `Status updated from ${previousStatus} to ${status}${notes ? ` - ${notes}` : ''}`,
      metadata: { previousStatus, newStatus: status, notes },
    });

    await createNotification({
      userId,
      type: 'STATUS_UPDATE',
      title: 'Status Updated',
      message: `${app.jobTitle} at ${app.company} updated to ${status}.`,
      applicationId: id,
    });

    return sendSuccess(res, 200, 'Application status updated successfully.', app);
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const app = await Application.findOneAndDelete({ _id: id, userId });
    if (!app) {
      return sendError(res, 404, 'Application not found.');
    }

    // Cascade delete linked interviews, activities, and notifications
    await Promise.all([
      Interview.deleteMany({ applicationId: id, userId }),
      Activity.deleteMany({ applicationId: id, userId }),
      Notification.deleteMany({ applicationId: id, userId }),
    ]);

    return sendSuccess(res, 200, 'Application and associated records deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const getApplicationStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await Application.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      Wishlist: 0,
      Applied: 0,
      Assessment: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0,
    };

    stats.forEach((item) => {
      if (result[item._id] !== undefined) {
        result[item._id] = item.count;
      }
      result.total += item.count;
    });

    return sendSuccess(res, 200, 'Application stats retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
};

export const exportApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, priority, search } = req.query;

    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ company: searchRegex }, { jobTitle: searchRegex }];
    }

    const applications = await Application.find(filter).sort({ applicationDate: -1 }).lean();
    const csvData = generateApplicationsCsv(applications);

    const filename = `careertrack-applications-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};
