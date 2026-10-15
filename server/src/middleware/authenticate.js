import { verifyAccessToken } from '../utils/token.js';
import { sendError } from '../utils/apiResponse.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 401, 'Authentication required. Please log in.');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Access token has expired. Please refresh your session.');
      }
      return sendError(res, 401, 'Invalid authentication token.');
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
    };

    next();
  } catch (error) {
    return sendError(res, 500, 'Authentication error: ' + error.message);
  }
};
