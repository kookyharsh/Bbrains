import { z } from 'zod';
import {
    createRoleRecord, getAllRoles, updateRoleRecord,
    deleteRoleRecord, assignRoleToUser, removeRoleFromUser, getUserRoles,
    updateRolePermissions, getAllPermissions, canManageRole
} from './role.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';
import prisma from '../../utils/prisma.js';

const roleSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(255).optional(),
    rank: z.number().int().min(0).optional(),
    collegeId: z.number().int().positive().nullable().optional()
});

// POST /roles
export const createRole = async (req, res) => {
    try {
        const validated = roleSchema.parse(req.body);
        
        // Only Super Admin can create global roles (collegeId = null)
        if (!req.user.isSuperAdmin) {
            validated.collegeId = req.user.collegeId;
            // Ensure rank is not higher than their own
            const userRank = Math.min(...req.user.roles.map(ur => ur.role.rank));
            if (validated.rank !== undefined && validated.rank <= userRank) {
                return sendError(res, 'Cannot create role with rank higher than or equal to your own', 403);
            }
        }

        const role = await createRoleRecord(validated);
        await createAuditLog(req.user.id, 'SYSTEM', 'CREATE', 'Role', role.id);
        return sendCreated(res, role, 'Role created successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        if (error.code === 'P2002') return sendError(res, 'Role name already exists', 409);
        return sendError(res, 'Failed to create role', 500);
    }
};

// GET /roles
export const getRoles = async (req, res) => {
    try {
        const collegeId = req.user.isSuperAdmin ? null : req.user.collegeId;
        const roles = await getAllRoles(collegeId);
        return sendSuccess(res, roles);
    } catch (error) {
        return sendError(res, 'Failed to fetch roles', 500);
    }
};

// PUT /roles/:id
export const updateRole = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid role ID', 400);

        const targetRole = await prisma.role.findUnique({ where: { id } });
        if (!targetRole) return sendError(res, 'Role not found', 404);

        if (!canManageRole(req.user, targetRole)) {
            return sendError(res, 'You do not have permission to manage this role (hierarchy restriction)', 403);
        }

        const validated = roleSchema.partial().parse(req.body);

        // Rank restriction
        if (!req.user.isSuperAdmin && validated.rank !== undefined) {
            const userRank = Math.min(...req.user.roles.map(ur => ur.role.rank));
            if (validated.rank <= userRank) {
                return sendError(res, 'Cannot set rank higher than or equal to your own', 403);
            }
        }

        const role = await updateRoleRecord(id, validated);
        await createAuditLog(req.user.id, 'SYSTEM', 'UPDATE', 'Role', id);
        return sendSuccess(res, role, 'Role updated successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Role not found', 404);
        return sendError(res, 'Failed to update role', 500);
    }
};

// DELETE /roles/:id
export const deleteRole = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid role ID', 400);

        const targetRole = await prisma.role.findUnique({ where: { id } });
        if (!targetRole) return sendError(res, 'Role not found', 404);

        if (!canManageRole(req.user, targetRole)) {
            return sendError(res, 'You do not have permission to delete this role', 403);
        }

        await deleteRoleRecord(id);
        await createAuditLog(req.user.id, 'SYSTEM', 'DELETE', 'Role', id);
        return sendSuccess(res, null, 'Role deleted successfully');
    } catch (error) {
        if (error.message?.includes('Cannot delete')) return sendError(res, error.message, 400);
        if (error.code === 'P2025') return sendError(res, 'Role not found', 404);
        return sendError(res, 'Failed to delete role', 500);
    }
};

// GET /permissions
export const listPermissions = async (req, res) => {
    try {
        const permissions = await getAllPermissions();
        return sendSuccess(res, permissions);
    } catch (error) {
        return sendError(res, 'Failed to fetch permissions', 500);
    }
};

// POST /roles/:id/permissions
export const updatePermissions = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { permissionIds } = req.body; // Array of Permission IDs
        if (!Array.isArray(permissionIds)) return sendError(res, 'permissionIds must be an array', 400);

        const targetRole = await prisma.role.findUnique({ where: { id } });
        if (!targetRole) return sendError(res, 'Role not found', 404);

        if (!canManageRole(req.user, targetRole)) {
            return sendError(res, 'You do not have permission to manage this role', 403);
        }

        // Optional: Check if the user has the permissions they are granting
        if (!req.user.isSuperAdmin) {
            const userPermissions = new Set();
            req.user.roles.forEach(ur => ur.role.permissions?.forEach(rp => userPermissions.add(rp.permissionId)));
            const hasAdmin = req.user.roles.some(ur => ur.role.permissions?.some(rp => rp.permission.name === 'administrator'));
            
            if (!hasAdmin) {
                const invalidPerms = permissionIds.filter(pId => !userPermissions.has(pId));
                if (invalidPerms.length > 0) {
                    return sendError(res, 'You cannot grant permissions you do not possess', 403);
                }
            }
        }

        const role = await updateRolePermissions(id, permissionIds);
        await createAuditLog(req.user.id, 'SYSTEM', 'UPDATE', 'RolePermissions', id);
        return sendSuccess(res, role, 'Role permissions updated successfully');
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to update role permissions', 500);
    }
};

// POST /users/:userId/roles
export const assignRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleId } = req.body;
        if (!roleId) return sendError(res, 'roleId is required', 400);

        const targetRole = await prisma.role.findUnique({ where: { id: parseInt(roleId) } });
        if (!targetRole) return sendError(res, 'Role not found', 404);

        if (!canManageRole(req.user, targetRole)) {
            return sendError(res, 'You do not have permission to assign this role', 403);
        }

        const userRole = await assignRoleToUser(userId, parseInt(roleId));
        await createAuditLog(req.user.id, 'SYSTEM', 'CREATE', 'UserRoles', `${userId}-${roleId}`);
        return sendCreated(res, userRole, 'Role assigned successfully');
    } catch (error) {
        if (error.code === 'P2002') return sendError(res, 'Role already assigned', 409);
        return sendError(res, 'Failed to assign role', 500);
    }
};

// DELETE /users/:userId/roles/:roleId
export const removeRole = async (req, res) => {
    try {
        const { userId, roleId } = req.params;
        
        const targetRole = await prisma.role.findUnique({ where: { id: parseInt(roleId) } });
        if (!targetRole) return sendError(res, 'Role not found', 404);

        if (!canManageRole(req.user, targetRole)) {
            return sendError(res, 'You do not have permission to remove this role', 403);
        }

        await removeRoleFromUser(userId, parseInt(roleId));
        await createAuditLog(req.user.id, 'SYSTEM', 'DELETE', 'UserRoles', `${userId}-${roleId}`);
        return sendSuccess(res, null, 'Role removed successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Role assignment not found', 404);
        return sendError(res, 'Failed to remove role', 500);
    }
};

// GET /roles/users
export const getUsersWithRoles = async (req, res) => {
    try {
        const collegeId = req.user.isSuperAdmin ? null : req.user.collegeId;
        const users = await prisma.user.findMany({
            where: collegeId ? { collegeId } : {},
            select: {
                id: true,
                username: true,
                email: true,
                isSuperAdmin: true,
                enrollments: {
                    select: {
                        grade: true
                    },
                    take: 1
                },
                userDetails: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Format to match frontend expected type
        const formattedUsers = users.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            isSuperAdmin: u.isSuperAdmin,
            firstName: u.userDetails?.firstName || "",
            lastName: u.userDetails?.lastName || "",
            avatar: u.userDetails?.avatar || "",
            grade: u.enrollments?.[0]?.grade || "N/A",
            roles: u.roles
        }));

        return sendSuccess(res, formattedUsers);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch users with roles', 500);
    }
};

// GET /users/:userId/roles
export const listUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        // Self or admin with permission
        // We'll use the existing authorize('admin') on the route, but we can refine here
        if (userId !== req.user.id && !req.user.isSuperAdmin && req.user.type !== 'admin') {
             // In a real app we might check for 'view_users' permission
             // For now keep it consistent with existing
             return sendError(res, 'Not authorized', 403);
        }
        const roles = await getUserRoles(userId);
        return sendSuccess(res, roles);
    } catch (error) {
        return sendError(res, 'Failed to fetch roles', 500);
    }
};
