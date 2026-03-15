import { ForbiddenError } from '../utils/errors.js';

/**
 * Role-based authorization middleware.
 * Usage: authorize('admin', 'teacher')
 * Checks req.user.type against allowed roles.
 * Must be used AFTER verifyToken middleware.
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        if (!allowedRoles.includes(req.user.type)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

export default authorize;
