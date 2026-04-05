import prisma from '../../utils/prisma.js';
import { createNotification } from '../notification/notification.service.js';
import { AppError, ForbiddenError, NotFoundError } from '../../utils/errors.js';

const ensureAssessmentModelsAvailable = (client = prisma) => {
    if (!client?.assessment || !client?.assessmentResult) {
        throw new AppError(
            "Assessment models are not available in the running Prisma client. Apply the latest migration, run `npx prisma generate`, and restart the server.",
            500
        );
    }
};

const normalizeDate = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const normalizeStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
        .map((entry) => String(entry ?? '').trim())
        .filter(Boolean);
};

const resolveTeacherSubjects = (teacher) => {
    return normalizeStringArray(teacher?.userDetails?.teacherSubjects);
};

const resolveCourseSubjects = (course) => {
    const subjects = normalizeStringArray(course?.subjects);
    return subjects.length > 0 ? subjects : [course?.name].filter(Boolean);
};

const mapCourseForSetup = (course, teacherSubjects) => {
    const courseSubjects = resolveCourseSubjects(course);
    const availableSubjects = teacherSubjects.length > 0
        ? courseSubjects.filter((subject) => teacherSubjects.includes(subject))
        : courseSubjects;

    return {
        id: course.id,
        name: course.name,
        standard: course.standard,
        collegeId: course.collegeId,
        subjects: courseSubjects,
        availableSubjects: availableSubjects.length > 0 ? availableSubjects : (teacherSubjects.length > 0 ? teacherSubjects : courseSubjects),
        studentCount: course._count?.enrollments ?? 0,
    };
};

const getTeacherAndCourses = async (teacherId) => {
    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: {
            id: true,
            type: true,
            collegeId: true,
            userDetails: {
                select: {
                    teacherSubjects: true,
                },
            },
        },
    });

    if (!teacher) {
        throw new NotFoundError('Teacher');
    }

    const courses = await prisma.course.findMany({
        where: teacher.collegeId ? { collegeId: teacher.collegeId } : undefined,
        include: {
            _count: {
                select: {
                    enrollments: true,
                },
            },
        },
        orderBy: [
            { standard: 'asc' },
            { name: 'asc' },
        ],
    });

    return { teacher, courses };
};

export const getAssessmentSetup = async (teacherId, courseId = null, date = null) => {
    ensureAssessmentModelsAvailable();
    const { teacher, courses } = await getTeacherAndCourses(teacherId);
    const teacherSubjects = resolveTeacherSubjects(teacher);
    const mappedCourses = courses.map((course) => mapCourseForSetup(course, teacherSubjects));

    let eligibleStudents = [];

    if (courseId && date) {
        eligibleStudents = await getEligibleStudents(courseId, date);
    }

    return {
        teacherSubjects,
        courses: mappedCourses,
        eligibleStudents,
    };
};

export const getEligibleStudents = async (courseId, date) => {
    ensureAssessmentModelsAvailable();
    const normalizedDate = normalizeDate(date);

    const attendanceRecords = await prisma.attendance.findMany({
        where: {
            date: normalizedDate,
            status: 'present',
            user: {
                enrollments: {
                    some: {
                        courseId: Number(courseId),
                    },
                },
            },
        },
        select: {
            userId: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            user: {
                username: 'asc',
            },
        },
    });

    return attendanceRecords.map((record) => ({
        id: record.user.id,
        username: record.user.username,
        email: record.user.email,
        userDetails: record.user.userDetails,
    }));
};

const validateSubjectForCourse = (course, subject, teacherSubjects) => {
    const allowedCourseSubjects = resolveCourseSubjects(course);
    const normalizedSubject = String(subject ?? '').trim();

    if (!normalizedSubject) {
        throw new AppError('Subject is required', 400);
    }

    if (teacherSubjects.length > 0 && !teacherSubjects.includes(normalizedSubject)) {
        throw new ForbiddenError('This subject is not assigned to the current teacher');
    }

    if (allowedCourseSubjects.length > 0 && !allowedCourseSubjects.includes(normalizedSubject)) {
        throw new AppError('Selected subject is not part of the selected class', 400);
    }
};

const validateResults = (results, totalMarks, eligibleStudentIds) => {
    if (!Array.isArray(results) || results.length === 0) {
        throw new AppError('At least one student result is required', 400);
    }

    const seen = new Set();

    results.forEach((result, index) => {
        const studentId = String(result.studentId ?? '').trim();
        const marksObtained = Number(result.marksObtained);

        if (!studentId) {
            throw new AppError(`Student is missing for row ${index + 1}`, 400);
        }

        if (seen.has(studentId)) {
            throw new AppError('Duplicate student result detected', 400);
        }

        if (!eligibleStudentIds.has(studentId)) {
            throw new AppError('Only students marked present on the selected date can be graded', 400);
        }

        if (!Number.isFinite(marksObtained) || marksObtained < 0) {
            throw new AppError('Marks must be zero or greater', 400);
        }

        if (marksObtained > totalMarks) {
            throw new AppError('Student marks cannot exceed the total marks', 400);
        }

        seen.add(studentId);
    });
};

const assessmentInclude = {
    course: {
        select: {
            id: true,
            name: true,
            standard: true,
            collegeId: true,
        },
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
    results: {
        include: {
            student: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            student: {
                username: 'asc',
            },
        },
    },
};

const prepareAssessmentPayload = async (teacherId, payload) => {
    ensureAssessmentModelsAvailable();
    const normalizedDate = normalizeDate(payload.assessmentDate);
    const totalMarks = Number(payload.totalMarks);

    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
        throw new AppError('Total marks must be greater than zero', 400);
    }

    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: {
            id: true,
            type: true,
            collegeId: true,
            userDetails: {
                select: {
                    teacherSubjects: true,
                },
            },
        },
    });

    if (!teacher) {
        throw new NotFoundError('Teacher');
    }

    const course = await prisma.course.findUnique({
        where: { id: Number(payload.courseId) },
        select: {
            id: true,
            name: true,
            standard: true,
            collegeId: true,
            subjects: true,
        },
    });

    if (!course) {
        throw new NotFoundError('Class');
    }

    if (Number(course.collegeId ?? 0) !== Number(teacher.collegeId ?? 0)) {
        throw new ForbiddenError('You can only create assessments for classes in your college');
    }

    const teacherSubjects = resolveTeacherSubjects(teacher);
    validateSubjectForCourse(course, payload.subject, teacherSubjects);

    const eligibleStudents = await getEligibleStudents(course.id, normalizedDate);
    if (eligibleStudents.length === 0) {
        throw new AppError('No students were marked present for the selected class and date', 400);
    }

    const eligibleStudentIds = new Set(eligibleStudents.map((student) => student.id));
    validateResults(payload.results, totalMarks, eligibleStudentIds);

    return {
        normalizedDate,
        totalMarks,
        eligibleStudents,
        assessmentData: {
            courseId: course.id,
            createdById: teacherId,
            subject: String(payload.subject).trim(),
            topic: String(payload.topic).trim(),
            assessmentType: payload.assessmentType,
            assessmentDate: normalizedDate,
            totalMarks,
        },
    };
};

const notifyStudents = async (assessment) => {
    await Promise.all(
        assessment.results.map((result) =>
            createNotification(
                result.student.id,
                `${assessment.assessmentType === 'exam' ? 'Exam' : 'Test'} Result Published`,
                `Your ${assessment.assessmentType} result for ${assessment.subject} - ${assessment.topic} is now available.`,
                'grade',
                String(assessment.id)
            )
        )
    );
};

export const createAssessmentWithResults = async (teacherId, payload) => {
    ensureAssessmentModelsAvailable();
    const prepared = await prepareAssessmentPayload(teacherId, payload);

    const assessment = await prisma.$transaction(async (tx) => {
        ensureAssessmentModelsAvailable(tx);
        return await tx.assessment.create({
            data: {
                ...prepared.assessmentData,
                results: {
                    create: payload.results.map((result) => ({
                        studentId: result.studentId,
                        marksObtained: Number(result.marksObtained),
                        remark: result.remark?.trim() || null,
                    })),
                },
            },
            include: assessmentInclude,
        });
    });

    await notifyStudents(assessment);
    return assessment;
};

export const updateAssessmentWithResults = async (assessmentId, currentUser, payload) => {
    ensureAssessmentModelsAvailable();
    const existing = await prisma.assessment.findUnique({
        where: { id: Number(assessmentId) },
        select: {
            id: true,
            createdById: true,
            course: {
                select: {
                    collegeId: true,
                },
            },
        },
    });

    if (!existing) {
        throw new NotFoundError('Assessment');
    }

    if (Number(existing.course?.collegeId ?? 0) !== Number(currentUser.collegeId ?? 0)) {
        throw new ForbiddenError('You can only update assessments in your college');
    }

    const isAdmin = currentUser.type === 'admin';
    if (!isAdmin && existing.createdById !== currentUser.id) {
        throw new ForbiddenError('You can only update assessments you created');
    }

    const prepared = await prepareAssessmentPayload(existing.createdById, payload);

    const nextStudentIds = payload.results.map((result) => result.studentId);

    const assessment = await prisma.$transaction(async (tx) => {
        ensureAssessmentModelsAvailable(tx);
        await tx.assessment.update({
            where: { id: Number(assessmentId) },
            data: prepared.assessmentData,
        });

        await tx.assessmentResult.deleteMany({
            where: {
                assessmentId: Number(assessmentId),
                studentId: {
                    notIn: nextStudentIds,
                },
            },
        });

        for (const result of payload.results) {
            await tx.assessmentResult.upsert({
                where: {
                    assessmentId_studentId: {
                        assessmentId: Number(assessmentId),
                        studentId: result.studentId,
                    },
                },
                create: {
                    assessmentId: Number(assessmentId),
                    studentId: result.studentId,
                    marksObtained: Number(result.marksObtained),
                    remark: result.remark?.trim() || null,
                },
                update: {
                    marksObtained: Number(result.marksObtained),
                    remark: result.remark?.trim() || null,
                },
            });
        }

        return await tx.assessment.findUnique({
            where: { id: Number(assessmentId) },
            include: assessmentInclude,
        });
    });

    await notifyStudents(assessment);
    return assessment;
};

export const getTeacherAssessments = async (currentUser) => {
    ensureAssessmentModelsAvailable();
    const where = currentUser.type === 'teacher'
        ? {
            createdById: currentUser.id,
            course: {
                collegeId: currentUser.collegeId,
            },
        }
        : currentUser.collegeId
            ? {
                course: {
                    collegeId: currentUser.collegeId,
                },
            }
            : {};

    return await prisma.assessment.findMany({
        where,
        include: assessmentInclude,
        orderBy: [
            { assessmentDate: 'desc' },
            { createdAt: 'desc' },
        ],
    });
};

export const getAssessmentById = async (assessmentId, currentUser) => {
    ensureAssessmentModelsAvailable();
    const assessment = await prisma.assessment.findUnique({
        where: { id: Number(assessmentId) },
        include: assessmentInclude,
    });

    if (!assessment) {
        throw new NotFoundError('Assessment');
    }

    if (Number(assessment.course?.collegeId ?? 0) !== Number(currentUser.collegeId ?? 0)) {
        throw new ForbiddenError('You are not allowed to view this assessment');
    }

    if (currentUser.type !== 'admin' && currentUser.type !== 'manager' && assessment.createdById !== currentUser.id) {
        throw new ForbiddenError('You are not allowed to view this assessment');
    }

    return assessment;
};

export const getStudentAssessmentResults = async (studentId) => {
    ensureAssessmentModelsAvailable();
    return await prisma.assessmentResult.findMany({
        where: {
            studentId,
        },
        include: {
            assessment: {
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                            standard: true,
                        },
                    },
                    createdBy: {
                        select: {
                            username: true,
                            userDetails: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: [
            {
                assessment: {
                    assessmentDate: 'desc',
                },
            },
            {
                createdAt: 'desc',
            },
        ],
    });
};
