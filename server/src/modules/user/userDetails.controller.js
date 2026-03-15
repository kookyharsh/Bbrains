import { z } from 'zod';
import {
    createUserDetailsRecord,
    getUserDetailsById,
    updateUserDetailsRecord
} from './userDetails.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

// Zod Schemas
const createDetailsSchema = z.object({
    firstName: z.string().min(2).max(25),
    lastName: z.string().min(2).max(25),
    middlename: z.string().optional(),
    sex: z.enum(['male', 'female', 'other']),
    dob: z.string().refine(val => {
        const date = new Date(val);
        const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 13;
    }, { message: 'User must be at least 13 years old' }),
    phone: z.string().max(15).optional(),
    avatar: z.string().url().optional(),
    addressId: z.number().int().positive().optional()
});

const updateDetailsSchema = createDetailsSchema.partial();

// POST /users/me/details
export const createDetails = async (req, res) => {
    try {
        const validated = createDetailsSchema.parse(req.body);

        // Check if details already exist
        const existing = await getUserDetailsById(req.user.id);
        if (existing) return sendError(res, 'User details already exist. Use PUT to update.', 409);

        const details = await createUserDetailsRecord(req.user.id, validated);
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'UserDetails', details.id);
        return sendCreated(res, details, 'User details created successfully');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        }
        console.error(error);
        return sendError(res, 'Failed to create user details', 500);
    }
};

// GET /users/me/details
export const getMyDetails = async (req, res) => {
    try {
        const details = await getUserDetailsById(req.user.id);
        if (!details) return sendError(res, 'User details not found', 404);
        return sendSuccess(res, details);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch user details', 500);
    }
};

// PUT /users/me/details
export const updateMyDetails = async (req, res) => {
    try {
        const validated = updateDetailsSchema.parse(req.body);
        const details = await updateUserDetailsRecord(req.user.id, validated);

        await createAuditLog(req.user.id, 'USER', 'UPDATE', 'UserDetails', details.id, { after: validated });
        return sendSuccess(res, details, 'User details updated successfully');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        }
        if (error.code === 'P2025') return sendError(res, 'User details not found. Create them first.', 404);
        console.error(error);
        return sendError(res, 'Failed to update user details', 500);
    }
};

// GET /users/:id/details (teachers/admins only)
export const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const details = await getUserDetailsById(userId);
        if (!details) return sendError(res, 'User details not found', 404);
        return sendSuccess(res, details);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch user details', 500);
    }
};
