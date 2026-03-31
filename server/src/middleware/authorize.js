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

        const hasManagerRole = (req.user.roles || []).some((entry) =>
            entry?.role?.name?.toLowerCase().includes('manager')
        );

        const authorizedByType = allowedRoles.includes(req.user.type);
        const authorizedByManagerRole = allowedRoles.includes('manager') && hasManagerRole;

        const hasBbrainsOfficialRole = (req.user.roles || []).some((entry) =>
            entry?.role?.name?.toLowerCase().includes('bbrains_official') || entry?.role?.name?.toLowerCase().includes('admin') // also give admin for now
        );
        const authorizedByBbrainsOfficial = allowedRoles.includes('bbrains_official') && (hasBbrainsOfficialRole || req.user.type === 'admin');

        if (!authorizedByType && !authorizedByManagerRole && !authorizedByBbrainsOfficial) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

export default authorize;
