import prisma from '../../utils/prisma.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';

const normalizeStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
        .map((entry) => String(entry ?? '').trim())
        .filter(Boolean);
};

const normalizeChapterCount = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.floor(parsed);
};

const normalizeSubjectProgress = (value) => {
    if (!Array.isArray(value)) return [];

    return value
        .map((entry) => {
            const subject = String(entry?.subject ?? '').trim();
            if (!subject) return null;

            const totalChapters = normalizeChapterCount(entry?.totalChapters);
            const completedChapters = totalChapters > 0
                ? Math.min(normalizeChapterCount(entry?.completedChapters), totalChapters)
                : 0;

            return {
                subject,
                totalChapters,
                completedChapters,
            };
        })
        .filter(Boolean);
};

const buildSubjectProgress = (subjects, nextProgress = [], existingProgress = []) => {
    const normalizedSubjects = normalizeStringArray(subjects);
    const nextEntries = normalizeSubjectProgress(nextProgress);
    const existingEntries = normalizeSubjectProgress(existingProgress);

    return normalizedSubjects.map((subject) => {
        const configuredEntry = nextEntries.find((entry) => entry.subject === subject);
        const existingEntry = existingEntries.find((entry) => entry.subject === subject);
        const baseEntry = configuredEntry || existingEntry;

        return {
            subject,
            totalChapters: baseEntry?.totalChapters ?? 0,
            completedChapters: baseEntry?.completedChapters ?? 0,
        };
    });
};

const mapCourseRecord = (course) => {
    if (!course) return course;

    const subjects = normalizeStringArray(course.subjects);
    const subjectProgress = buildSubjectProgress(subjects, course.subjectProgress);

    return {
        ...course,
        subjects,
        subjectProgress,
    };
};

const prepareCreateCourseData = (data) => {
    const subjects = normalizeStringArray(data.subjects);

    return {
        ...data,
        subjects,
        subjectProgress: buildSubjectProgress(subjects, data.subjectProgress),
    };
};

const prepareUpdateCourseData = async (id, data) => {
    const currentCourse = await prisma.course.findUnique({
        where: { id },
        select: {
            subjects: true,
            subjectProgress: true,
        },
    });

    const payload = { ...data };

    if (data.subjects !== undefined) {
        payload.subjects = normalizeStringArray(data.subjects);
    }

    if (data.subjects !== undefined || data.subjectProgress !== undefined) {
        const subjects = data.subjects !== undefined
            ? payload.subjects
            : normalizeStringArray(currentCourse?.subjects);

        payload.subjectProgress = buildSubjectProgress(
            subjects,
            data.subjectProgress,
            currentCourse?.subjectProgress
        );
    }

    return payload;
};

const hasManagerPrivileges = (currentUser) => {
    if (!currentUser) return false;
    if (currentUser.type === 'admin' || currentUser.type === 'manager') return true;

    return (currentUser.roles || []).some((entry) =>
        entry?.role?.name?.toLowerCase().includes('manager')
    );
};

const buildCourseVisibilityWhere = (currentUser, search = '') => {
    const searchWhere = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { standard: { contains: search, mode: 'insensitive' } },
            ]
        }
        : {};

    if (!currentUser) return Object.keys(searchWhere).length ? searchWhere : undefined;

    const teacherScoped = currentUser.type === 'teacher' && !hasManagerPrivileges(currentUser)
        ? { classTeacherId: currentUser.id }
        : {};

    const collegeScoped = currentUser?.collegeId ? { collegeId: currentUser.collegeId } : {};

    return {
        ...searchWhere,
        ...teacherScoped,
        ...collegeScoped,
    };
};

const assertCourseTeacherAccess = (course, currentUser, action = 'manage this class') => {
    if (!course) {
        throw new NotFoundError('Course');
    }

    if (!currentUser) {
        throw new ForbiddenError();
    }

    if (currentUser.type === 'teacher' && !hasManagerPrivileges(currentUser) && course.classTeacherId !== currentUser.id) {
        throw new ForbiddenError(`You can only ${action} for classes assigned to you as class teacher`);
    }
};

export const createCourseRecord = async (data) => {
    const created = await prisma.course.create({
        data: prepareCreateCourseData(data),
    });

    return mapCourseRecord(created);
};

export const getAllCourses = async (skip = 0, take = 20, search = '', currentUser = null) => {
    const where = buildCourseVisibilityWhere(currentUser, search);

    const [courses, total] = await prisma.$transaction([
        prisma.course.findMany({
            skip, take,
            where,
            include: {
                _count: { select: { enrollments: true, assignments: true } },
                classTeacher: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: {
                            select: {
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.course.count({ where })
    ]);
    return {
        courses: courses.map(mapCourseRecord),
        total,
    };
};

export const getCourseById = async (id, currentUser = null) => {
    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            assignments: { orderBy: { createdAt: 'desc' } },
            _count: { select: { enrollments: true } },
            classTeacher: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            }
        }
    });

    assertCourseTeacherAccess(course, currentUser, 'view this class');
    return mapCourseRecord(course);
};

export const updateCourseRecord = async (id, data, currentUser = null) => {
    const existing = await prisma.course.findUnique({
        where: { id },
        select: {
            id: true,
            classTeacherId: true,
            subjects: true,
            subjectProgress: true,
        },
    });

    assertCourseTeacherAccess(existing, currentUser, 'update this class');
    const payload = await prepareUpdateCourseData(id, data);
    const updated = await prisma.course.update({
        where: { id },
        data: payload,
    });

    return mapCourseRecord(updated);
};

export const deleteCourseRecord = async (id) => {
    return await prisma.course.delete({ where: { id } });
};

export const getCourseStudents = async (courseId, currentUser = null) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
            id: true,
            classTeacherId: true,
        },
    });

    assertCourseTeacherAccess(course, currentUser, 'view students for this class');
    return await prisma.enrollment.findMany({
        where: { courseId },
        include: {
            user: {
                select: {
                    id: true, username: true, email: true,
                    userDetails: { select: { firstName: true, lastName: true, avatar: true } }
                }
            }
        }
    });
};

export const getCourseAssignments = async (courseId) => {
    return await prisma.assignment.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' }
    });
};
