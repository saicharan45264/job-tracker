import mongoose from 'mongoose';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createCompany = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, website, industry, location, notes } = req.body;

    const existing = await Company.findOne({ userId, name: name.trim() });
    if (existing) {
      return sendError(res, 409, `A company with name "${name}" already exists in your directory.`, [
        { field: 'name', message: 'Company already exists' },
      ]);
    }

    const company = await Company.create({
      userId,
      name: name.trim(),
      website: website || '',
      industry: industry || '',
      location: location || '',
      notes: notes || '',
    });

    return sendSuccess(res, 201, 'Company created successfully.', company);
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { search, industry } = req.query;

    const matchStage = { userId };
    if (industry) matchStage.industry = industry;
    if (search && search.trim()) {
      matchStage.name = { $regex: search.trim(), $options: 'i' };
    }

    const companies = await Company.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'applications',
          let: { compId: '$_id', compName: '$name' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', userId] },
                    {
                      $or: [
                        { $eq: ['$companyId', '$$compId'] },
                        { $eq: [{ $toLower: '$company' }, { $toLower: '$$compName' }] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'applications',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          website: 1,
          industry: 1,
          location: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          applicationCount: { $size: '$applications' },
        },
      },
      { $sort: { name: 1 } },
    ]);

    return sendSuccess(res, 200, 'Companies retrieved successfully.', companies);
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const company = await Company.findOne({ _id: id, userId }).lean();
    if (!company) {
      return sendError(res, 404, 'Company not found.');
    }

    // Get linked applications count
    const applicationCount = await Application.countDocuments({
      userId,
      $or: [{ companyId: id }, { company: company.name }],
    });

    return sendSuccess(res, 200, 'Company retrieved successfully.', {
      ...company,
      applicationCount,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const company = await Company.findOne({ _id: id, userId });
    if (!company) {
      return sendError(res, 404, 'Company not found.');
    }

    if (req.body.name && req.body.name.trim() !== company.name) {
      const duplicate = await Company.findOne({
        userId,
        name: req.body.name.trim(),
        _id: { $ne: id },
      });
      if (duplicate) {
        return sendError(res, 409, `Another company with name "${req.body.name}" already exists.`);
      }
    }

    const updated = await Company.findOneAndUpdate({ _id: id, userId }, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, 200, 'Company updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const company = await Company.findOneAndDelete({ _id: id, userId });
    if (!company) {
      return sendError(res, 404, 'Company not found.');
    }

    // Safely unset companyId reference on applications without deleting them
    await Application.updateMany({ userId, companyId: id }, { $set: { companyId: null } });

    return sendSuccess(res, 200, 'Company deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const getCompanyApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const company = await Company.findOne({ _id: id, userId });
    if (!company) {
      return sendError(res, 404, 'Company not found.');
    }

    const applications = await Application.find({
      userId,
      $or: [{ companyId: id }, { company: company.name }],
    })
      .sort({ applicationDate: -1 })
      .lean();

    return sendSuccess(res, 200, 'Company applications retrieved successfully.', applications);
  } catch (error) {
    next(error);
  }
};
