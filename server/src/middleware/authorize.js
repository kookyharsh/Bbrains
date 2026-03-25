import { ForbiddenError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';

/**
 * Role-based authorization middleware.
 * Usage: authorize('admin', 'teacher', 'super_admin')
 * Checks req.user.type against allowed roles or isSuperAdmin flag.
 * Must be used AFTER verifyToken middleware.
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 'Not authenticated', 401);
        }

        // Super Admin bypasses everything
        if (req.user.isSuperAdmin) {
            return next();
        }

        // Special check for 'super_admin' pseudo-role
        if (allowedRoles.includes('super_admin')) {
            // If super_admin is required and user is not one (already checked above),
            // and no other roles match, they are forbidden.
            if (allowedRoles.length === 1) {
                return sendError(res, 'Super Admin access required', 403);
            }
        }

        if (!allowedRoles.includes(req.user.type)) {
            return sendError(res, 'You do not have permission to perform this action', 403);
        }

        next();
    };
};

/**
 * Permission-based authorization middleware.
 * Usage: checkPermission('manage_courses')
 * Checks if any of the user's roles have the required permission.
 */
export const checkPermission = (permissionName) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 'Not authenticated', 401);
        }

        // Super Admin bypasses everything
        if (req.user.isSuperAdmin) {
            return next();
        }

        // Extract permissions from user roles
        const userPermissions = new Set();
        req.user.roles?.forEach(ur => {
            ur.role.permissions?.forEach(rp => {
                userPermissions.add(rp.permission.name);
            });
        });

        // Administrator role permission can bypass standard permission checks
        if (userPermissions.has('administrator') || userPermissions.has(permissionName)) {
            return next();
        }

        return sendError(res, `Missing required permission: ${permissionName}`, 403);
    };
};

export default authorize;
