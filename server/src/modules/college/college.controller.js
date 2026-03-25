import { z } from 'zod';
import {
    createCollegeRecord,
    getAllColleges,
    getCollegeById,
    updateCollegeRecord,
    deleteCollegeRecord
} from './college.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

// Zod Schemas
const createCollegeSchema = z.object({
    name: z.string().min(1).max(50),
    email: z.string().email().max(50),
    regNo: z.string().min(1).max(50),
    addressId: z.number().int().positive().optional()
});

const updateCollegeSchema = createCollegeSchema.partial();

// POST /colleges
export const createCollege = async (req, res) => {
    try {
        const validated = createCollegeSchema.parse(req.body);
        const college = await createCollegeRecord(validated);

        await createAuditLog(req.user.id, 'SYSTEM', 'CREATE', 'College', college.id);
        return sendCreated(res, college, 'College created successfully');
    } catch (error) {
        if (error.name === 'ZodError') {
      const validationErrors = Array.isArray(error.errors)
        ? error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        : [{ message: 'Unknown validation error format' }];
      return sendError(res, 'Validation failed', 400, validationErrors);
        }
        if (error.code === 'P2002') return sendError(res, 'College with this email or registration number already exists', 409);
        console.error(error);
        return sendError(res, 'Failed to create college', 500);
    }
};

// GET /colleges
export const getColleges = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const { colleges, total } = await getAllColleges(skip, limit);
        return sendPaginated(res, colleges, { page, limit, total });
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch colleges', 500);
    }
};

// GET /colleges/:id
export const getCollege = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid college ID', 400);

        // Security check for regular admins
        if (!req.user.isSuperAdmin && req.user.collegeId !== id) {
            return sendError(res, 'Unauthorized: You can only view your own college', 403);
        }

        const college = await getCollegeById(id);
        if (!college) return sendError(res, 'College not found', 404);

        return sendSuccess(res, college);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch college', 500);
    }
};

// PUT /colleges/:id
export const updateCollege = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid college ID', 400);

        // Security check for regular admins
        if (!req.user.isSuperAdmin && req.user.collegeId !== id) {
            return sendError(res, 'Unauthorized: You can only update your own college', 403);
        }

        const validated = updateCollegeSchema.parse(req.body);
        const college = await updateCollegeRecord(id, validated);

        await createAuditLog(req.user.id, 'SYSTEM', 'UPDATE', 'College', id, { after: validated });
        return sendSuccess(res, college, 'College updated successfully');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        }
        if (error.code === 'P2025') return sendError(res, 'College not found', 404);
        console.error(error);
        return sendError(res, 'Failed to update college', 500);
    }
};

// DELETE /colleges/:id
export const deleteCollege = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid college ID', 400);

        await deleteCollegeRecord(id);
        await createAuditLog(req.user.id, 'SYSTEM', 'DELETE', 'College', id);
        return sendSuccess(res, null, 'College deleted successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'College not found', 404);
        console.error(error);
        return sendError(res, 'Failed to delete college', 500);
    }
};
