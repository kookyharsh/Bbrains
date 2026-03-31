import { z } from 'zod';
import {
    createCourseRecord, getAllCourses, getCourseById,
    updateCourseRecord, deleteCourseRecord, getCourseStudents, getCourseAssignments
} from './course.service.js';
import { sendSuccess, sendCreated, sendPaginated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

const timetableEntrySchema = z.object({
    day: z.string().min(1).max(20),
    subject: z.string().min(1).max(100),
    startTime: z.string().min(1).max(10),
    endTime: z.string().min(1).max(10),
    room: z.string().max(50).optional().nullable(),
});

const subjectProgressEntrySchema = z.object({
    subject: z.string().min(1).max(100),
    totalChapters: z.coerce.number().int().min(0),
    completedChapters: z.coerce.number().int().min(0),
}).refine(
    (entry) => entry.completedChapters <= entry.totalChapters,
    {
        message: 'Completed chapters cannot exceed total chapters',
        path: ['completedChapters'],
    }
);

const createCourseSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional(),
    standard: z.string().min(1).max(50),
    subjects: z.array(z.string().min(1).max(100)).min(1),
    subjectProgress: z.array(subjectProgressEntrySchema).optional(),
    feePerStudent: z.coerce.number().min(0),
    durationValue: z.coerce.number().int().positive(),
    durationUnit: z.enum(['months', 'years']),
    studentCapacity: z.coerce.number().int().min(1),
    timetable: z.array(timetableEntrySchema).min(1),
});

const updateCourseSchema = createCourseSchema.partial();

const getCourseOperationErrorMessage = (error, fallbackMessage) => {
    if (!error) return fallbackMessage;

    if (error.code === 'P2022') {
        return 'Course schema is outdated. Apply the latest database migration and try again.';
    }

    if (typeof error.message === 'string' && error.message.trim()) {
        const compactMessage = error.message
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .join(' ');

        return compactMessage.length > 220
            ? `${compactMessage.slice(0, 217)}...`
            : compactMessage;
    }

    return fallbackMessage;
};

const getStatusCode = (error, fallbackStatus = 500) => {
    if (typeof error?.statusCode === 'number') {
        return error.statusCode;
    }

    if (typeof error?.code === 'string' && error.code === 'P2025') {
        return 404;
    }

    return fallbackStatus;
};

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
        return sendError(res, getCourseOperationErrorMessage(error, 'Failed to create course'), 500);
    }
};

// GET /courses
export const getCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const search = typeof req.query.search === 'string' ? req.query.search : '';
        const { courses, total } = await getAllCourses((page - 1) * limit, limit, search, req.user);
        return sendPaginated(res, courses, { page, limit, total });
    } catch (error) {
        return sendError(res, getCourseOperationErrorMessage(error, 'Failed to fetch courses'), getStatusCode(error));
    }
};

// GET /courses/:id
export const getCourse = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid course ID', 400);
        const course = await getCourseById(id, req.user);
        if (!course) return sendError(res, 'Course not found', 404);
        return sendSuccess(res, course);
    } catch (error) {
        return sendError(res, getCourseOperationErrorMessage(error, 'Failed to fetch course'), getStatusCode(error));
    }
};

// PUT /courses/:id
export const updateCourse = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid course ID', 400);
        const validated = updateCourseSchema.parse(req.body);
        const course = await updateCourseRecord(id, validated, req.user);
        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Course', id, { after: validated });
        return sendSuccess(res, course, 'Course updated successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        console.error(error);
        return sendError(res, getCourseOperationErrorMessage(error, 'Failed to update course'), getStatusCode(error));
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
        const students = await getCourseStudents(id, req.user);
        return sendSuccess(res, students);
    } catch (error) {
        return sendError(res, getCourseOperationErrorMessage(error, 'Failed to fetch students'), getStatusCode(error));
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
