import { z } from 'zod';
import {
    createRoleRecord, getAllRoles, updateRoleRecord,
    deleteRoleRecord, assignRoleToUser, removeRoleFromUser, getUserRoles
} from './role.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

const roleSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().max(255).optional()
});

// POST /roles
export const createRole = async (req, res) => {
    try {
        const validated = roleSchema.parse(req.body);
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
        const roles = await getAllRoles();
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
        const validated = roleSchema.partial().parse(req.body);
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
        await deleteRoleRecord(id);
        await createAuditLog(req.user.id, 'SYSTEM', 'DELETE', 'Role', id);
        return sendSuccess(res, null, 'Role deleted successfully');
    } catch (error) {
        if (error.message?.includes('Cannot delete')) return sendError(res, error.message, 400);
        if (error.code === 'P2025') return sendError(res, 'Role not found', 404);
        return sendError(res, 'Failed to delete role', 500);
    }
};

// POST /users/:userId/roles
export const assignRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleId } = req.body;
        if (!roleId) return sendError(res, 'roleId is required', 400);

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
        await removeRoleFromUser(userId, parseInt(roleId));
        await createAuditLog(req.user.id, 'SYSTEM', 'DELETE', 'UserRoles', `${userId}-${roleId}`);
        return sendSuccess(res, null, 'Role removed successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Role assignment not found', 404);
        return sendError(res, 'Failed to remove role', 500);
    }
};

// GET /users/:userId/roles
export const listUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        // Self or admin
        if (userId !== req.user.id && req.user.type !== 'admin') {
            return sendError(res, 'Not authorized', 403);
        }
        const roles = await getUserRoles(userId);
        return sendSuccess(res, roles);
    } catch (error) {
        return sendError(res, 'Failed to fetch roles', 500);
    }
};
