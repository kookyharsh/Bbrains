import prisma from '../utils/prisma.js';
import { findUserBySupabaseId } from '../modules/user/user.service.js';
import supabase from '../utils/supabase.js';
import { sendError } from '../utils/response.js';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[AuthMiddleware] New request to:', req.path);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[AuthMiddleware] No valid Authorization header provided');
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('[AuthMiddleware] Supabase getUser error:', error.message);
      return sendError(res, 'Invalid or expired authentication', 401);
    }

    if (!user) {
      console.warn('[AuthMiddleware] No user found for provided token');
      return sendError(res, 'User authentication failed', 401);
    }

    // Attach Supabase user for potential use in modules
    req.supabaseUser = user;

    // Find local user in database
    const dbUser = await findUserBySupabaseId(user.id);

    if (!dbUser) {
      console.error('[AuthMiddleware] DB User not found for Supabase ID:', user.id);
      return sendError(res, 'User authenticated but not found in system database', 403);
    }

    // Attach full database user to request
    req.user = dbUser;
    
    console.log(`[AuthMiddleware] User verified: ${dbUser.username} (${dbUser.type})`);
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Unexpected server error:', err);
    return sendError(res, 'Internal server error during authentication', 500);
  }
};

export default verifyToken;

