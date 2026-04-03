import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { sendError } from '../utils/response.js';
import { isDatabaseUnavailableError } from '../utils/prisma-errors.js';

const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1];
    }

    if (!token || token === 'null' || token === 'undefined' || token === '') {
      token = req.cookies?.token;
    }

    if (!token) {
      console.warn('[AuthMiddleware] No token provided');
      return sendError(res, 'No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      console.warn('[AuthMiddleware] Invalid token payload');
      return sendError(res, 'Invalid or expired authentication', 401);
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!dbUser) {
      console.error('[AuthMiddleware] User not found in database for ID:', decoded.id);
      return sendError(res, 'User not found in system database', 403);
    }

    req.user = dbUser;
    
    console.log(`[AuthMiddleware] User verified: ${dbUser.username} (${dbUser.type})`);
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      console.error('[AuthMiddleware] Token verification error:', err.message);
      return sendError(res, 'Invalid or expired authentication token', 401);
    }
    if (isDatabaseUnavailableError(err)) {
      console.error('[AuthMiddleware] Database connectivity error:', err);
      return sendError(res, 'Database temporarily unavailable. Please try again in a moment.', 503);
    }
    console.error('[AuthMiddleware] Unexpected server error:', err);
    return sendError(res, 'Internal server error during authentication', 500);
  }
};

export default verifyToken;

