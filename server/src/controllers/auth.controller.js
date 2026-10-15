import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getCookieOptions,
} from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email address already exists.', [
        { field: 'email', message: 'Email is already registered' },
      ]);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    const userPayload = { id: user._id.toString(), email: user.email, name: user.name };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Save refresh token record
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    // Set cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());
    res.cookie('accessToken', accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    return sendSuccess(
      res,
      201,
      'Registration successful! Welcome to CareerTrack.',
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          preferences: user.preferences,
          createdAt: user.createdAt,
        },
        accessToken,
      }
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password credentials.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password credentials.');
    }

    const userPayload = { id: user._id.toString(), email: user.email, name: user.name };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    res.cookie('refreshToken', refreshToken, getCookieOptions());
    res.cookie('accessToken', accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    return sendSuccess(res, 200, 'Login successful! Welcome back.', {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingToken) {
      return sendError(res, 401, 'No refresh token provided.');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingToken);
    } catch (err) {
      return sendError(res, 401, 'Invalid or expired refresh token. Please log in again.');
    }

    const tokenRecord = await RefreshToken.findOne({
      tokenHash: hashToken(incomingToken),
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      return sendError(res, 401, 'Session has expired or was revoked. Please log in again.');
    }

    // Token rotation: Revoke old and create new
    tokenRecord.revoked = true;
    await tokenRecord.save();

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }

    const userPayload = { id: user._id.toString(), email: user.email, name: user.name };
    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken(userPayload);

    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const newRecord = await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: newExpiresAt,
    });

    tokenRecord.replacedByTokenHash = newRecord.tokenHash;
    await tokenRecord.save();

    res.cookie('refreshToken', newRefreshToken, getCookieOptions());
    res.cookie('accessToken', newAccessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    return sendSuccess(res, 200, 'Session refreshed successfully.', {
      accessToken: newAccessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (incomingToken) {
      await RefreshToken.findOneAndUpdate(
        { tokenHash: hashToken(incomingToken) },
        { revoked: true }
      );
    }

    res.clearCookie('refreshToken', getCookieOptions());
    res.clearCookie('accessToken', getCookieOptions());

    return sendSuccess(res, 200, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    return sendSuccess(res, 200, 'User profile retrieved successfully.', {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferences) {
      // Merge preferences
      updates.preferences = {
        ...req.user.preferences,
        ...preferences,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    return sendSuccess(res, 200, 'Profile updated successfully.', {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, 'Current password does not match.', [
        { field: 'currentPassword', message: 'Incorrect current password' },
      ]);
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Revoke all existing refresh tokens for security
    await RefreshToken.updateMany({ userId: user._id }, { revoked: true });

    return sendSuccess(res, 200, 'Password updated successfully. Please log in with your new password on other devices.');
  } catch (error) {
    next(error);
  }
};
