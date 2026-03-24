import {
    createAssignment, getAssignments, submitAssignment,
    getSubmissions, createAnnouncement, getAnnouncements,
    deleteAnnouncement
} from "./academic.service.js";
import { sendSuccess, sendCreated, sendError } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { z } from 'zod';
import prisma from "../../utils/prisma.js";

const assignmentSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    courseId: z.number().int().positive(),
    dueDate: z.string().optional(),
    file: z.string().url().optional()
});

const submissionSchema = z.object({
    assignmentId: z.number().int().positive(),
    content: z.string().optional(),
    fileUrl: z.string().url().optional()
});

const announcementSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    courseId: z.number().int().positive().optional()
});

// POST /academic/assignments
export const createAssignmentHandler = async (req, res) => {
    try {
        const validated = assignmentSchema.parse(req.body);
        // service function expects (teacherId, courseId, data)
        const assignment = await createAssignment(req.user.id, validated.courseId, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Assignment', assignment.id);
        return sendCreated(res, assignment, 'Assignment created');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to create assignment', 500);
    }
};

// GET /academic/assignments
export const getAssignmentsHandler = async (req, res) => {
    try {
        const courseId = req.query.courseId ? parseInt(req.query.courseId) : null;
        const assignments = await getAssignments(courseId);
        return sendSuccess(res, assignments);
    } catch (error) {
        return sendError(res, 'Failed to fetch assignments', 500);
    }
};

// GET /academic/assignments/:id
export const getAssignmentHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);
        const assignment = await prisma.assignment.findUnique({
            where: { id },
            include: {
                course: { select: { name: true } },
                submissions: { include: { user: { select: { username: true } } } },
                _count: { select: { submissions: true } }
            }
        });
        if (!assignment) return sendError(res, 'Assignment not found', 404);
        return sendSuccess(res, assignment);
    } catch (error) {
        return sendError(res, 'Failed to fetch assignment', 500);
    }
};

// PUT /academic/assignments/:id
export const updateAssignmentHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);
        const validated = assignmentSchema.partial().parse(req.body);
        const assignment = await prisma.assignment.update({ where: { id }, data: validated });
        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Assignment', id, { after: validated });
        return sendSuccess(res, assignment, 'Assignment updated');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Assignment not found', 404);
        return sendError(res, 'Failed to update assignment', 500);
    }
};

// DELETE /academic/assignments/:id
export const deleteAssignmentHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);
        await prisma.assignment.delete({ where: { id } });
        await createAuditLog(req.user.id, 'ACADEMIC', 'DELETE', 'Assignment', id);
        return sendSuccess(res, null, 'Assignment deleted');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Assignment not found', 404);
        return sendError(res, 'Failed to delete assignment', 500);
    }
};

// POST /academic/submissions
export const submitAssignmentHandler = async (req, res) => {
    try {
        const validated = submissionSchema.parse(req.body);
        const submission = await submitAssignment(req.user.id, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Submission', submission.id);
        return sendCreated(res, submission, 'Assignment submitted');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to submit', 500);
    }
};

// GET /academic/submissions/:assignmentId
export const getSubmissionsHandler = async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        if (isNaN(assignmentId)) return sendError(res, 'Invalid ID', 400);
        const submissions = await getSubmissions(assignmentId);
        return sendSuccess(res, submissions);
    } catch (error) {
        return sendError(res, 'Failed to fetch submissions', 500);
    }
};

// POST /academic/announcements
export const createAnnouncementHandler = async (req, res) => {
    try {
        const validated = announcementSchema.parse(req.body);
        const announcement = await createAnnouncement(req.user.id, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Announcement', announcement.id);
        return sendCreated(res, announcement, 'Announcement created');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to create announcement', 500);
    }
};

// GET /academic/announcements
export const getAnnouncementsHandler = async (req, res) => {
    try {
        const announcements = await getAnnouncements();
        return sendSuccess(res, announcements);
    } catch (error) {
        return sendError(res, 'Failed to fetch announcements', 500);
    }
};

// DELETE /academic/announcements/:id
export const deleteAnnouncementHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);
        await deleteAnnouncement(id);
        await createAuditLog(req.user.id, 'ACADEMIC', 'DELETE', 'Announcement', id);
        return sendSuccess(res, null, 'Announcement deleted');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Announcement not found', 404);
        return sendError(res, 'Failed to delete announcement', 500);
    }
};
