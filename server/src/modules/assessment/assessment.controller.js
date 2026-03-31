import { z } from 'zod';
import {
    createAssessmentWithResults,
    getAssessmentById,
    getAssessmentSetup,
    getStudentAssessmentResults,
    getTeacherAssessments,
    updateAssessmentWithResults,
} from './assessment.service.js';
import { createAuditLog } from '../../utils/auditLog.js';
import { sendCreated, sendError, sendSuccess } from '../../utils/response.js';

const assessmentResultSchema = z.object({
    studentId: z.string().uuid(),
    marksObtained: z.coerce.number().min(0),
    remark: z.string().trim().max(255).optional().or(z.literal('')),
});

const assessmentSchema = z.object({
    courseId: z.coerce.number().int().positive(),
    subject: z.string().trim().min(1).max(100),
    topic: z.string().trim().min(1).max(150),
    assessmentType: z.enum(['test', 'exam']),
    assessmentDate: z.string().min(1),
    totalMarks: z.coerce.number().positive(),
    results: z.array(assessmentResultSchema).min(1),
});

const getStatusCode = (error) => {
    if (typeof error?.statusCode === 'number') return error.statusCode;
    return 500;
};

const getErrorMessage = (error, fallback) => {
    if (typeof error?.message === 'string' && error.message.trim()) return error.message;
    return fallback;
};

export const getAssessmentSetupHandler = async (req, res) => {
    try {
        const courseId = req.query.courseId ? Number(req.query.courseId) : null;
        const date = typeof req.query.date === 'string' ? req.query.date : null;
        const setup = await getAssessmentSetup(req.user.id, courseId, date);
        return sendSuccess(res, setup);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to load assessment setup'), getStatusCode(error));
    }
};

export const createAssessmentHandler = async (req, res) => {
    try {
        const validated = assessmentSchema.parse(req.body);
        const assessment = await createAssessmentWithResults(req.user.id, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Assessment', assessment.id, {
            courseId: validated.courseId,
            subject: validated.subject,
            topic: validated.topic,
            type: validated.assessmentType,
            resultCount: validated.results.length,
        });
        return sendCreated(res, assessment, 'Assessment saved successfully');
    } catch (error) {
        if (error?.name === 'ZodError') {
            return sendError(
                res,
                'Validation failed',
                400,
                error.errors.map((entry) => ({
                    field: entry.path.join('.'),
                    message: entry.message,
                }))
            );
        }

        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to save assessment'), getStatusCode(error));
    }
};

export const updateAssessmentHandler = async (req, res) => {
    try {
        const assessmentId = Number(req.params.id);
        if (!Number.isInteger(assessmentId) || assessmentId <= 0) {
            return sendError(res, 'Invalid assessment ID', 400);
        }

        const validated = assessmentSchema.parse(req.body);
        const assessment = await updateAssessmentWithResults(assessmentId, req.user, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Assessment', assessment.id, {
            courseId: validated.courseId,
            subject: validated.subject,
            topic: validated.topic,
            type: validated.assessmentType,
            resultCount: validated.results.length,
        });
        return sendSuccess(res, assessment, 'Assessment updated successfully');
    } catch (error) {
        if (error?.name === 'ZodError') {
            return sendError(
                res,
                'Validation failed',
                400,
                error.errors.map((entry) => ({
                    field: entry.path.join('.'),
                    message: entry.message,
                }))
            );
        }

        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to update assessment'), getStatusCode(error));
    }
};

export const listTeacherAssessmentsHandler = async (req, res) => {
    try {
        const assessments = await getTeacherAssessments(req.user);
        return sendSuccess(res, assessments);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch assessments'), getStatusCode(error));
    }
};

export const getAssessmentHandler = async (req, res) => {
    try {
        const assessmentId = Number(req.params.id);
        if (!Number.isInteger(assessmentId) || assessmentId <= 0) {
            return sendError(res, 'Invalid assessment ID', 400);
        }

        const assessment = await getAssessmentById(assessmentId, req.user);
        return sendSuccess(res, assessment);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch assessment'), getStatusCode(error));
    }
};

export const getMyAssessmentResultsHandler = async (req, res) => {
    try {
        const results = await getStudentAssessmentResults(req.user.id);
        return sendSuccess(res, results);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch assessment results'), getStatusCode(error));
    }
};
