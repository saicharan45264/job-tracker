import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    return sendSuccess(res, 200, 'Settings retrieved successfully.', {
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    if (name) user.name = name;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();

    return sendSuccess(res, 200, 'Settings updated successfully.', {
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
