import {
    getUsersByRole,
    getUserByName,
    createTeacher,
    createStudent,
    createManager,
    deleteUser as deleteManagedUser,
    getUserDetailsByID,
    getUserSummaryByID,
    findUserByEmail,
    findUserByUsername
} from "./user.service.js";
import { sendSuccess, sendPaginated, sendError, sendCreated } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import prisma from "../../utils/prisma.js";
import { z } from "zod";

// Zod Schemas
const addTeacherSchema = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email().max(50),
    password: z.string().min(8),
    collegeId: z.number().int().positive().optional(),
    firstName: z.string().min(2).max(25),
    lastName: z.string().min(2).max(25),
    sex: z.enum(['male', 'female', 'other']),
    dob: z.string(),
    phone: z.string().max(15).optional(),
    teacherSubjects: z.array(z.string().min(1).max(100)).min(1),
    classTeacherCourseId: z.number().int().positive().optional().nullable(),
});

const createStudentSchema = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email().max(50),
    password: z.string().min(8),
    collegeId: z.number().int().positive().optional(),
    firstName: z.string().min(2).max(25),
    lastName: z.string().min(2).max(25),
    sex: z.enum(['male', 'female', 'other']),
    dob: z.string(),
    phone: z.string().max(15).optional(),
    classId: z.number().int().positive(),
});

const createManagerSchema = createStudentSchema.omit({
    classId: true,
}).extend({
    bio: z.string().max(500).optional()
});

const formatZodErrors = (error) => {
    const issues = Array.isArray(error?.issues)
        ? error.issues
        : Array.isArray(error?.errors)
            ? error.errors
            : [];

    return issues.map((entry) => ({
        field: Array.isArray(entry?.path) ? entry.path.join('.') : '',
        message: entry?.message || 'Invalid value',
    }));
};

const resolveCollegeId = async (requestedCollegeId, fallbackCollegeId) => {
    if (
        requestedCollegeId !== undefined &&
        requestedCollegeId !== null &&
        fallbackCollegeId &&
        Number(requestedCollegeId) !== Number(fallbackCollegeId)
    ) {
        throw new Error('You can only manage users within your own college');
    }

    const collegeId = requestedCollegeId ?? fallbackCollegeId;

    if (!collegeId) {
        throw new Error('No college is associated with the current admin account');
    }

    const college = await prisma.college.findUnique({
        where: { id: Number(collegeId) },
        select: { id: true }
    });

    if (!college) {
        throw new Error(`College ${collegeId} does not exist`);
    }

    return college.id;
};

const findCourseInCollege = async (tx, courseId, collegeId, notFoundMessage) => {
    const course = await tx.course.findUnique({
        where: { id: Number(courseId) },
        select: {
            id: true,
            collegeId: true,
            classTeacherId: true,
        }
    });

    if (!course || Number(course.collegeId ?? 0) !== Number(collegeId)) {
        throw new Error(notFoundMessage);
    }

    return course;
};

const syncTeacherClassTeacherAssignment = async (tx, teacherId, nextCourseId, collegeId) => {
    await tx.course.updateMany({
        where: { classTeacherId: teacherId },
        data: { classTeacherId: null }
    });

    if (!nextCourseId) return;

    const course = await findCourseInCollege(tx, nextCourseId, collegeId, 'Selected class was not found for this college');

    if (course.classTeacherId && course.classTeacherId !== teacherId) {
        throw new Error('This class already has a class teacher assigned');
    }

    await tx.course.update({
        where: { id: course.id },
        data: {
            classTeacherId: teacherId,
        }
    });
};

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
            where: { 
                username,
                collegeId: req.user.collegeId
            },
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
        const result = await getUsersByRole('student', req.user.collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 'Failed to fetch students', 500);
    }
};

// GET /users/teachers
export const getTeachers = async (req, res) => {
    try {
        const result = await getUsersByRole('teacher', req.user.collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 'Failed to fetch teachers', 500);
    }
};

// GET /users/staff
export const getStaff = async (req, res) => {
    try {
        const result = await getUsersByRole('staff', req.user.collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 'Failed to fetch staff', 500);
    }
};

// GET /users/managers
export const getManagers = async (req, res) => {
    try {
        const managers = await prisma.user.findMany({
            where: {
                collegeId: req.user.collegeId,
                roles: {
                    some: {
                        role: {
                            name: {
                                contains: 'manager',
                                mode: 'insensitive'
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                type: true,
                userDetails: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        sex: true,
                        dob: true,
                        phone: true,
                        bio: true
                    }
                },
                wallet: {
                    select: {
                        id: true,
                        balance: true,
                    },
                },
                xp: {
                    select: {
                        xp: true,
                        level: true,
                    },
                },
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return sendSuccess(res, managers);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch managers', 500);
    }
};

// GET /users/students/:username
export const getStudentByUsername = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { 
                username: req.params.username, 
                type: 'student',
                collegeId: req.user.collegeId
            },
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
            where: { 
                username: req.params.username, 
                type: 'teacher',
                collegeId: req.user.collegeId
            },
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
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId);
        const [existingEmail, existingUsername] = await Promise.all([
            findUserByEmail(validated.email),
            findUserByUsername(validated.username),
        ]);
        if (existingEmail || existingUsername) return sendError(res, 'Username or email already exists', 409);

        const result = await createTeacher({
            ...validated,
            collegeId,
        });
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'User', result.id, null, 'Teacher added');
        return sendCreated(res, result, 'Teacher account created successfully.');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }
        if (error.code === 'P2002') return sendError(res, 'Username or email already exists', 409);
        console.error("Add Teacher Error:", error);
        return sendError(res, error?.message || 'Failed to add teacher', 500);
    }
};

// POST /users/students
export const addStudent = async (req, res) => {
    try {
        const validated = createStudentSchema.parse(req.body);
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId);
        const [existingEmail, existingUsername] = await Promise.all([
            findUserByEmail(validated.email),
            findUserByUsername(validated.username),
        ]);
        if (existingEmail || existingUsername) return sendError(res, 'Username or email already exists', 409);

        const result = await createStudent({
            ...validated,
            collegeId,
        });
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'User', result.id, null, 'Student added');
        return sendCreated(res, result, 'Student account created successfully.');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }
        if (error.code === 'P2002') return sendError(res, 'Username or email already exists', 409);
        console.error("Add Student Error:", error);
        return sendError(res, error?.message || 'Failed to add student', 500);
    }
};

// POST /users/managers
export const addManager = async (req, res) => {
    try {
        const validated = createManagerSchema.parse(req.body);
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId);
        const [existingEmail, existingUsername] = await Promise.all([
            findUserByEmail(validated.email),
            findUserByUsername(validated.username),
        ]);
        if (existingEmail || existingUsername) return sendError(res, 'Username or email already exists', 409);

        const result = await createManager({
            ...validated,
            collegeId,
        });
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'User', result.id, null, 'Manager added');
        return sendCreated(res, result, 'Manager account created successfully.');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }
        if (error.code === 'P2002') return sendError(res, 'Username or email already exists', 409);
        console.error("Add Manager Error:", error);
        return sendError(res, error?.message || 'Failed to add manager', 500);
    }
};

// PUT /users/teachers/:id
export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                id,
                type: 'teacher',
                collegeId: req.user.collegeId,
            }
        });
        if (!user || user.type !== 'teacher') return sendError(res, 'Teacher not found', 404);

        const {
            firstName,
            lastName,
            sex,
            dob,
            phone,
            bio,
            collegeId,
            teacherSubjects,
            classTeacherCourseId,
        } = req.body;
        const effectiveCollegeId = collegeId !== undefined
            ? await resolveCollegeId(collegeId, req.user.collegeId)
            : user.collegeId;

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    ...(effectiveCollegeId ? { collegeId: Number(effectiveCollegeId) } : {}),
                    userDetails: {
                        upsert: {
                            create: {
                                firstName: firstName ?? '',
                                lastName: lastName ?? '',
                                sex: sex ?? 'other',
                                dob: dob ? new Date(dob) : new Date('2000-01-01'),
                                phone: phone ?? null,
                                bio: bio ?? null,
                                ...(teacherSubjects !== undefined ? { teacherSubjects } : {}),
                            },
                            update: {
                                ...(firstName !== undefined ? { firstName } : {}),
                                ...(lastName !== undefined ? { lastName } : {}),
                                ...(sex !== undefined ? { sex } : {}),
                                ...(dob !== undefined ? { dob: new Date(dob) } : {}),
                                ...(phone !== undefined ? { phone } : {}),
                                ...(bio !== undefined ? { bio } : {}),
                                ...(teacherSubjects !== undefined ? { teacherSubjects } : {}),
                            }
                        }
                    }
                }
            });

            if (classTeacherCourseId !== undefined) {
                await syncTeacherClassTeacherAssignment(tx, id, classTeacherCourseId || null, effectiveCollegeId);
            }
        });

        await createAuditLog(req.user.id, 'USER', 'UPDATE', 'User', id, { after: req.body });
        const updatedTeacher = await getUserSummaryByID(id);
        return sendSuccess(res, updatedTeacher, 'Teacher updated successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Teacher not found', 404);
        console.error(error);
        return sendError(res, error?.message || 'Failed to update teacher', 500);
    }
};

// PUT /users/students/:id
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                id,
                type: 'student',
                collegeId: req.user.collegeId,
            }
        });
        if (!user || user.type !== 'student') return sendError(res, 'Student not found', 404);

        const {
            firstName,
            lastName,
            sex,
            dob,
            phone,
            bio,
            collegeId,
            classId,
        } = req.body;
        const effectiveCollegeId = collegeId !== undefined
            ? await resolveCollegeId(collegeId, req.user.collegeId)
            : user.collegeId;

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    ...(effectiveCollegeId ? { collegeId: Number(effectiveCollegeId) } : {}),
                    userDetails: {
                        upsert: {
                            create: {
                                firstName: firstName ?? '',
                                lastName: lastName ?? '',
                                sex: sex ?? 'other',
                                dob: dob ? new Date(dob) : new Date('2008-01-01'),
                                phone: phone ?? null,
                                bio: bio ?? null,
                            },
                            update: {
                                ...(firstName !== undefined ? { firstName } : {}),
                                ...(lastName !== undefined ? { lastName } : {}),
                                ...(sex !== undefined ? { sex } : {}),
                                ...(dob !== undefined ? { dob: new Date(dob) } : {}),
                                ...(phone !== undefined ? { phone } : {}),
                                ...(bio !== undefined ? { bio } : {}),
                            }
                        }
                    }
                }
            });

            if (classId !== undefined) {
                const nextCourseId = Number(classId);
                await findCourseInCollege(tx, nextCourseId, effectiveCollegeId, 'Selected class was not found for this college');

                await tx.enrollment.deleteMany({
                    where: { userId: id }
                });

                await tx.enrollment.create({
                    data: {
                        userId: id,
                        courseId: nextCourseId,
                    }
                });
            }
        });

        await createAuditLog(req.user.id, 'USER', 'UPDATE', 'User', id, { after: req.body });
        const updatedStudent = await getUserSummaryByID(id);
        return sendSuccess(res, updatedStudent, 'Student updated successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Student not found', 404);
        console.error(error);
        return sendError(res, error?.message || 'Failed to update student', 500);
    }
};

// DELETE /users/teachers/:id
export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.type !== 'teacher') return sendError(res, 'Teacher not found', 404);

        await deleteManagedUser(id);
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

        const result = await getUserByName(name, req.user.collegeId);
        if (!result) return sendError(res, "User not found", 404);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 'Search failed', 500);
    }
};
