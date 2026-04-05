import {
    createAssignment, getAssignments, submitAssignment, getMySubmissions,
    getSubmissions, reviewSubmission, createAnnouncement, getAnnouncements,
    deleteAnnouncement
} from "./academic.service.js";
import { sendSuccess, sendCreated, sendError } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { z } from 'zod';
import prisma from "../../utils/prisma.js";
import { getCourseById } from "../course/course.service.js";

const assignmentSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    courseId: z.number().int().positive(),
    dueDate: z.string().optional(),
    file: z.string().url().optional(),
    rewardPoints: z.number().int().min(0).optional(),
});

const submissionSchema = z.object({
    assignmentId: z.number().int().positive(),
    content: z.string().optional(),
    fileUrl: z.string().url(),
}).refine((value) => Boolean(value.fileUrl), {
    message: "A file upload is required",
    path: ["fileUrl"],
});

const submissionReviewSchema = z.object({
    reviewStatus: z.enum(["completed", "incomplete"]),
    reviewRemark: z.string().max(255).optional().nullable(),
});

const announcementSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    image: z.string().url().optional(),
    isGlobal: z.boolean().optional(),
    courseId: z.number().int().positive().optional()
});

const getStatusCode = (error, fallbackStatus = 500) => {
    if (typeof error?.statusCode === 'number') {
        return error.statusCode;
    }

    if (typeof error?.code === 'string' && error.code === 'P2025') {
        return 404;
    }

    return fallbackStatus;
};

// POST /academic/assignments
export const createAssignmentHandler = async (req, res) => {
    try {
        const validated = assignmentSchema.parse(req.body);
        const assignment = await createAssignment(req.user, validated.courseId, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Assignment', assignment.id);
        return sendCreated(res, assignment, 'Assignment created');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        console.error(error);
        return sendError(res, error?.message || 'Failed to create assignment', getStatusCode(error));
    }
};

// GET /academic/assignments
export const getAssignmentsHandler = async (req, res) => {
    try {
        const courseId = req.query.courseId ? parseInt(req.query.courseId) : null;
        const assignments = await getAssignments(courseId, req.user);
        return sendSuccess(res, assignments);
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to fetch assignments', getStatusCode(error));
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
                course: {
                    select: {
                        id: true,
                        name: true,
                        standard: true,
                        collegeId: true,
                        enrollments: req.user.type === "student"
                            ? {
                                where: { userId: req.user.id },
                                select: { userId: true },
                            }
                            : undefined,
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                submissions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                userDetails: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                        reviewer: {
                            select: {
                                id: true,
                                username: true,
                                userDetails: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                    }
                },
                _count: { select: { submissions: true } }
            }
        });
        if (!assignment || assignment.course?.collegeId !== req.user.collegeId) return sendError(res, 'Assignment not found', 404);

        if (req.user.type === "teacher") {
            await getCourseById(assignment.courseId, req.user);
        }

        if (req.user.type === "student" && !assignment.course?.enrollments?.length) {
            return sendError(res, 'Assignment not found', 404);
        }

        return sendSuccess(res, assignment);
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to fetch assignment', getStatusCode(error));
    }
};

// PUT /academic/assignments/:id
export const updateAssignmentHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const existing = await prisma.assignment.findUnique({
            where: { id },
            include: { course: { select: { collegeId: true } } }
        });

        if (!existing || existing.course?.collegeId !== req.user.collegeId) {
            return sendError(res, 'Assignment not found', 404);
        }

        if (req.user.type === "teacher") {
            if (existing.createdById && existing.createdById !== req.user.id) {
                return sendError(res, 'You can only update your own assignments', 403);
            }
            await getCourseById(existing.courseId, req.user);
        }

        const updateSchema = z.object({
            title: z.string().min(1).max(100).optional(),
            description: z.string().max(255).optional().nullable(),
            courseId: z.number().int().positive().optional(),
            dueDate: z.string().optional().nullable(),
            file: z.string().url().optional().nullable(),
            rewardPoints: z.number().int().min(0).optional(),
        });

        const validated = updateSchema.parse(req.body);
        const data = { ...validated };

        if (req.user.type === "teacher" && data.courseId) {
            await getCourseById(data.courseId, req.user);
        }

        if (data.dueDate) {
            data.dueDate = new Date(data.dueDate);
            data.dueDate.setHours(23, 59, 59, 999);
        }

        if (data.description === null) delete data.description;
        if (data.dueDate === null) delete data.dueDate;
        if (data.file === null) delete data.file;

        const assignment = await prisma.assignment.update({
            where: { id },
            data,
            include: {
                course: { select: { id: true, name: true, standard: true } },
                _count: { select: { submissions: true } },
            }
        });

        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Assignment', id, { after: validated });
        return sendSuccess(res, assignment, 'Assignment updated');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        if (error.code === 'P2025') return sendError(res, 'Assignment not found', 404);
        if (error.code === 'P2003') return sendError(res, 'Invalid course ID', 400);
        console.error(error);
        return sendError(res, error?.message || 'Failed to update assignment', getStatusCode(error));
    }
};

// DELETE /academic/assignments/:id
export const deleteAssignmentHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const existing = await prisma.assignment.findUnique({
            where: { id },
            include: { course: { select: { collegeId: true } } }
        });

        if (!existing || existing.course?.collegeId !== req.user.collegeId) {
            return sendError(res, 'Assignment not found', 404);
        }

        if (req.user.type === "teacher") {
            if (existing.createdById && existing.createdById !== req.user.id) {
                return sendError(res, 'You can only delete your own assignments', 403);
            }
            await getCourseById(existing.courseId, req.user);
        }

        await prisma.assignment.delete({ where: { id } });
        await createAuditLog(req.user.id, 'ACADEMIC', 'DELETE', 'Assignment', id);
        return sendSuccess(res, null, 'Assignment deleted');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Assignment not found', 404);
        console.error(error);
        return sendError(res, error?.message || 'Failed to delete assignment', getStatusCode(error));
    }
};

// POST /academic/submissions
export const submitAssignmentHandler = async (req, res) => {
    try {
        const validated = submissionSchema.parse(req.body);

        const assignment = await prisma.assignment.findUnique({
            where: { id: validated.assignmentId },
            include: { course: { select: { collegeId: true } } }
        });

        if (!assignment || assignment.course?.collegeId !== req.user.collegeId) {
            return sendError(res, 'Assignment not found', 404);
        }

        const submission = await submitAssignment(req.user, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Submission', submission.id);
        return sendCreated(res, submission, 'Assignment submitted');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        console.error(error);
        return sendError(res, error?.message || 'Failed to submit', getStatusCode(error));
    }
};

// GET /academic/submissions/me
export const getMySubmissionsHandler = async (req, res) => {
    try {
        const submissions = await getMySubmissions(req.user.id);
        return sendSuccess(res, submissions);
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to fetch submissions', getStatusCode(error));
    }
};

// GET /academic/submissions/:assignmentId
export const getSubmissionsHandler = async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        if (isNaN(assignmentId)) return sendError(res, 'Invalid ID', 400);

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { course: { select: { collegeId: true } } }
        });

        if (!assignment || assignment.course?.collegeId !== req.user.collegeId) {
            return sendError(res, 'Assignment not found', 404);
        }

        const submissions = await getSubmissions(assignmentId, req.user);
        return sendSuccess(res, submissions);
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to fetch submissions', getStatusCode(error));
    }
};

// PATCH /academic/submissions/:submissionId/review
export const reviewSubmissionHandler = async (req, res) => {
    try {
        const submissionId = parseInt(req.params.submissionId);
        if (isNaN(submissionId)) return sendError(res, 'Invalid ID', 400);

        const validated = submissionReviewSchema.parse(req.body);
        const submission = await reviewSubmission(submissionId, req.user, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Submission', submissionId, { after: validated });
        return sendSuccess(res, submission, 'Submission reviewed');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        console.error(error);
        return sendError(res, error?.message || 'Failed to review submission', getStatusCode(error));
    }
};

// POST /academic/announcements
export const createAnnouncementHandler = async (req, res) => {
    try {
        const validated = announcementSchema.parse(req.body ?? {});
        const userId = req.user?.id;
        const collegeId = req.user?.collegeId; // Ensure your auth middleware attaches collegeId to req.user

        if (!userId || !collegeId) {
            return res.status(401).json({ success: false, message: "Unauthorized missing user or college id" });
        }

        const announcement = await createAnnouncement(userId, validated, collegeId);
        await createAuditLog(userId, 'ACADEMIC', 'CREATE', 'Announcement', announcement.id);
        return sendCreated(res, announcement, 'Announcement created');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to create announcement', 500);
    }
};

// GET /academic/announcements
export const getAnnouncementsHandler = async (req, res) => {
    try {
        const announcements = await getAnnouncements(req.user?.collegeId);
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
