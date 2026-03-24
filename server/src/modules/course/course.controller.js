import { z } from 'zod';
import {
    createCourseRecord, getAllCourses, getCourseById,
    updateCourseRecord, deleteCourseRecord, getCourseStudents, getCourseAssignments
} from './course.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

const createCourseSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional()
});

const updateCourseSchema = createCourseSchema.partial();

// POST /courses
export const createCourse = async (req, res) => {
    try {
        const validated = createCourseSchema.parse(req.body);
        const course = await createCourseRecord(validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Course', course.id);
        return sendCreated(res, course, 'Course created successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        console.error(error);
        return sendError(res, 'Failed to create course', 500);
    }
};

// GET /courses
export const getCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const { courses, total } = await getAllCourses((page - 1) * limit, limit);
        return sendPaginated(res, courses, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch courses', 500);
    }
};

// GET /courses/:id
export const getCourse = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid course ID', 400);
        const course = await getCourseById(id);
        if (!course) return sendError(res, 'Course not found', 404);
        return sendSuccess(res, course);
    } catch (error) {
        return sendError(res, 'Failed to fetch course', 500);
    }
};

// PUT /courses/:id
export const updateCourse = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid course ID', 400);
        const validated = updateCourseSchema.parse(req.body);
        const course = await updateCourseRecord(id, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Course', id, { after: validated });
        return sendSuccess(res, course, 'Course updated successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        if (error.code === 'P2025') return sendError(res, 'Course not found', 404);
        return sendError(res, 'Failed to update course', 500);
    }
};

// DELETE /courses/:id
export const deleteCourse = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid course ID', 400);
        await deleteCourseRecord(id);
        await createAuditLog(req.user.id, 'ACADEMIC', 'DELETE', 'Course', id);
        return sendSuccess(res, null, 'Course deleted successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Course not found', 404);
        return sendError(res, 'Failed to delete course', 500);
    }
};

// GET /courses/:id/students
export const listCourseStudents = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid course ID', 400);
        const students = await getCourseStudents(id);
        return sendSuccess(res, students);
    } catch (error) {
        return sendError(res, 'Failed to fetch students', 500);
    }
};

// GET /courses/:id/assignments
export const listCourseAssignments = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid course ID', 400);
        const assignments = await getCourseAssignments(id);
        return sendSuccess(res, assignments);
    } catch (error) {
        return sendError(res, 'Failed to fetch assignments', 500);
    }
};
