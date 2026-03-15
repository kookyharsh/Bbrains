import { z } from 'zod';
import {
    createGradeRecord, getGradesByUser, getGradesByStudent,
    updateGradeRecord, getGradesByAssignment, getGradeById
} from './grade.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

const gradeSchema = z.object({
    userId: z.string().uuid(),
    assignmentId: z.number().int().positive(),
    grade: z.string().max(5)
});

const updateGradeSchema = z.object({
    grade: z.string().max(5)
});

// POST /grades
export const gradeSubmission = async (req, res) => {
    try {
        const validated = gradeSchema.parse(req.body);
        const grade = await createGradeRecord({
            ...validated,
            gradedBy: req.user.username
        });

        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Grade', grade.id, { grade: validated.grade });
        return sendCreated(res, grade, 'Graded successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        console.error(error);
        return sendError(res, 'Failed to grade', 500);
    }
};

// GET /grades/me
export const getMyGrades = async (req, res) => {
    try {
        const grades = await getGradesByUser(req.user.id);
        return sendSuccess(res, grades);
    } catch (error) {
        return sendError(res, 'Failed to fetch grades', 500);
    }
};

// GET /grades/student/:userId
export const getStudentGrades = async (req, res) => {
    try {
        const grades = await getGradesByStudent(req.params.userId);
        return sendSuccess(res, grades);
    } catch (error) {
        return sendError(res, 'Failed to fetch grades', 500);
    }
};

// PUT /grades/:id
export const updateGrade = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid grade ID', 400);

        const existing = await getGradeById(id);
        if (!existing) return sendError(res, 'Grade not found', 404);

        // Only grader or admin can update
        if (existing.gradedBy !== req.user.username && req.user.type !== 'admin') {
            return sendError(res, 'Not authorized to update this grade', 403);
        }

        const validated = updateGradeSchema.parse(req.body);
        const grade = await updateGradeRecord(id, { ...validated, gradedBy: req.user.username });

        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Grade', id, { before: existing.grade, after: validated.grade });
        return sendSuccess(res, grade, 'Grade updated successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to update grade', 500);
    }
};

// GET /grades/assignment/:assignmentId
export const getAssignmentGrades = async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        if (isNaN(assignmentId)) return sendError(res, 'Invalid assignment ID', 400);
        const grades = await getGradesByAssignment(assignmentId);
        return sendSuccess(res, grades);
    } catch (error) {
        return sendError(res, 'Failed to fetch grades', 500);
    }
};
