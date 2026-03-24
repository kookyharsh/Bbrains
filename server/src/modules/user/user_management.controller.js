import { getUsersByRole, getUserByName, createTeacher, getUserDetailsByID, findUserByEmail } from "./user.service.js";
import { sendSuccess, sendPaginated, sendError, sendCreated } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import prisma from "../../utils/prisma.js";
import { z } from "zod";

// Zod Schemas
const addTeacherSchema = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email().max(50),
    password: z.string().min(8).optional(), // optional depending on future auth flow
    collegeId: z.number().int().positive(),
    firstName: z.string().min(2).max(25),
    lastName: z.string().min(2).max(25),
    sex: z.enum(['male', 'female', 'other']),
    dob: z.string(),
    phone: z.string().max(15).optional()
});

// GET /users/me - Get own profile
export const getMe = async (req, res) => {
    try {
        const userData = await getUserDetailsByID(req.user.id);
        if (!userData) return sendError(res, 'User not found', 404);
        return sendSuccess(res, userData);
    } catch (error) {
        console.error('getMe error:', error);
        return sendError(res, `Failed to fetch profile: ${error.message}`, 500);
    }
};

// GET /users/:username - Get user by username
export const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                email: true,
                type: true,
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                        sex: true,
                        dob: true,
                        phone: req.user.type === 'student' ? false : true
                    }
                },
                xp: { select: { xp: true, level: true } }
            }
        });

        if (!user) return sendError(res, 'User not found', 404);
        return sendSuccess(res, user);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch user', 500);
    }
};

// GET /users/students
export const getStudents = async (req, res) => {
    try {
        const result = await getUsersByRole('student');
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 'Failed to fetch students', 500);
    }
};

// GET /users/teachers
export const getTeachers = async (req, res) => {
    try {
        const result = await getUsersByRole('teacher');
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 'Failed to fetch teachers', 500);
    }
};

// GET /users/students/:username
export const getStudentByUsername = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { username: req.params.username, type: 'student' },
            select: {
                id: true, username: true, email: true, type: true,
                userDetails: true,
                enrollments: { include: { course: true } },
                xp: true
            }
        });
        if (!user) return sendError(res, 'Student not found', 404);
        return sendSuccess(res, user);
    } catch (error) {
        return sendError(res, 'Failed to fetch student', 500);
    }
};

// GET /users/teachers/:username
export const getTeacherByUsername = async (req, res) => {
    try {
        const selectFields = {
            id: true, username: true, email: true, type: true,
            userDetails: {
                select: {
                    avatar: true, firstName: true, lastName: true
                }
            }
        };

        // Teachers/admins see full profile
        if (req.user.type === 'teacher' || req.user.type === 'admin') {
            selectFields.userDetails = true;
        }

        const user = await prisma.user.findFirst({
            where: { username: req.params.username, type: 'teacher' },
            select: selectFields
        });
        if (!user) return sendError(res, 'Teacher not found', 404);
        return sendSuccess(res, user);
    } catch (error) {
        return sendError(res, 'Failed to fetch teacher', 500);
    }
};

// POST /users/teachers — creates teacher directly in local DB
export const addTeacher = async (req, res) => {
    try {
        const validated = addTeacherSchema.parse(req.body);
        const existing = await findUserByEmail(validated.email);
        if (existing) return sendError(res, 'Username or email already exists', 409);

        // Without Clerk, generate a standard ID logic
        const newTeacherId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const result = await createTeacher({
            ...validated,
            id: newTeacherId,
            password: validated.password,
        });
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'User', result.id, null, 'Teacher added');
        return sendCreated(res, result, 'Teacher added successfully.');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        }
        if (error.code === 'P2002') return sendError(res, 'Username or email already exists', 409);
        console.error("Add Teacher Error:", error);
        return sendError(res, 'Failed to add teacher', 500);
    }
};

// PUT /users/teachers/:id
export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.type !== 'teacher') return sendError(res, 'Teacher not found', 404);

        const updated = await prisma.user.update({
            where: { id },
            data: req.body
        });

        await createAuditLog(req.user.id, 'USER', 'UPDATE', 'User', id, { after: req.body });
        return sendSuccess(res, updated, 'Teacher updated successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Teacher not found', 404);
        console.error(error);
        return sendError(res, 'Failed to update teacher', 500);
    }
};

// DELETE /users/teachers/:id
export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.type !== 'teacher') return sendError(res, 'Teacher not found', 404);

        await prisma.user.delete({ where: { id } });
        await createAuditLog(req.user.id, 'USER', 'DELETE', 'User', id, null, 'Teacher removed');
        return sendSuccess(res, null, 'Teacher deleted successfully');
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to delete teacher', 500);
    }
};

// GET /users/search?name=...
export const searchUser = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return sendError(res, "Name query parameter required", 400);

        const result = await getUserByName(name);
        if (!result) return sendError(res, "User not found", 404);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 'Search failed', 500);
    }
};
