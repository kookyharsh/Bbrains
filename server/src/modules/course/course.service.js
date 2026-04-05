import prisma from '../../utils/prisma.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';

const normalizeStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
        .map((entry) => String(entry ?? '').trim())
        .filter(Boolean);
};

const resolveCourseSubjects = (course) => {
    const subjects = normalizeStringArray(course?.subjects);
    return subjects.length > 0 ? subjects : [String(course?.name ?? '').trim()].filter(Boolean);
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

const prepareCreateCourseData = (data, currentUser = null) => {
    const subjects = normalizeStringArray(data.subjects);

    return {
        ...data,
        ...(currentUser?.collegeId ? { collegeId: Number(currentUser.collegeId) } : {}),
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

const assertCourseCollegeAccess = (course, currentUser, action = 'access this class') => {
    if (!course) {
        throw new NotFoundError('Course');
    }

    if (!currentUser) {
        throw new ForbiddenError();
    }

    if (currentUser.collegeId && Number(course.collegeId ?? 0) !== Number(currentUser.collegeId)) {
        throw new ForbiddenError(`You can only ${action} for classes in your college`);
    }
};

const buildCourseBaseWhere = (currentUser, search = '') => {
    const searchWhere = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { standard: { contains: search, mode: 'insensitive' } },
            ]
        }
        : {};

    if (!currentUser) return Object.keys(searchWhere).length ? searchWhere : undefined;

    const collegeScoped = currentUser?.collegeId ? { collegeId: currentUser.collegeId } : {};

    return {
        ...searchWhere,
        ...collegeScoped,
    };
};

const getTeacherSubjects = async (currentUser) => {
    if (!currentUser || currentUser.type !== 'teacher' || hasManagerPrivileges(currentUser)) {
        return [];
    }

    const teacher = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
            userDetails: {
                select: {
                    teacherSubjects: true,
                },
            },
        },
    });

    return normalizeStringArray(teacher?.userDetails?.teacherSubjects);
};

const canTeacherAccessCourse = (course, currentUser, teacherSubjects = []) => {
    if (!currentUser || currentUser.type !== 'teacher' || hasManagerPrivileges(currentUser)) {
        return true;
    }

    if (course?.classTeacherId === currentUser.id) {
        return true;
    }

    if (teacherSubjects.length === 0) {
        return true;
    }

    const courseSubjects = resolveCourseSubjects(course);
    return courseSubjects.some((subject) => teacherSubjects.includes(subject));
};

const assertCourseTeacherAccess = async (course, currentUser, action = 'manage this class') => {
    assertCourseCollegeAccess(course, currentUser, action);

    if (currentUser.type === 'teacher' && !hasManagerPrivileges(currentUser)) {
        const teacherSubjects = await getTeacherSubjects(currentUser);
        if (!canTeacherAccessCourse(course, currentUser, teacherSubjects)) {
            throw new ForbiddenError(`You can only ${action} for classes assigned to your teaching subjects`);
        }
    }
};

export const createCourseRecord = async (data, currentUser = null) => {
    const created = await prisma.course.create({
        data: prepareCreateCourseData(data, currentUser),
    });

    return mapCourseRecord(created);
};

export const getAllCourses = async (skip = 0, take = 20, search = '', currentUser = null) => {
    const where = buildCourseBaseWhere(currentUser, search);

    if (currentUser?.type === 'teacher' && !hasManagerPrivileges(currentUser)) {
        const teacherSubjects = await getTeacherSubjects(currentUser);
        const courses = await prisma.course.findMany({
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
        });

        const accessibleCourses = courses.filter((course) =>
            canTeacherAccessCourse(course, currentUser, teacherSubjects)
        );

        return {
            courses: accessibleCourses.slice(skip, skip + take).map(mapCourseRecord),
            total: accessibleCourses.length,
        };
    }

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

    await assertCourseTeacherAccess(course, currentUser, 'view this class');
    return mapCourseRecord(course);
};

export const updateCourseRecord = async (id, data, currentUser = null) => {
    const existing = await prisma.course.findUnique({
        where: { id },
        select: {
            id: true,
            collegeId: true,
            classTeacherId: true,
            name: true,
            subjects: true,
            subjectProgress: true,
        },
    });

    await assertCourseTeacherAccess(existing, currentUser, 'update this class');

    if (currentUser?.type === 'teacher' && !hasManagerPrivileges(currentUser)) {
        const isClassTeacher = existing.classTeacherId === currentUser.id;
        const requestedKeys = Object.keys(data);

        if (!isClassTeacher && requestedKeys.some((key) => key !== 'subjectProgress')) {
            throw new ForbiddenError('You can only update subject progress for classes linked to your teaching subjects');
        }
    }

    const payload = await prepareUpdateCourseData(id, data);

    if (currentUser?.type === 'teacher' && !hasManagerPrivileges(currentUser)) {
        const isClassTeacher = existing.classTeacherId === currentUser.id;

        if (!isClassTeacher && data.subjectProgress !== undefined) {
            const teacherSubjects = await getTeacherSubjects(currentUser);
            const courseSubjects = payload.subjects ?? resolveCourseSubjects(existing);
            const requestedBySubject = new Map(
                (Array.isArray(payload.subjectProgress) ? payload.subjectProgress : []).map((entry) => [entry.subject, entry])
            );
            const existingBySubject = new Map(
                buildSubjectProgress(courseSubjects, existing.subjectProgress, existing.subjectProgress).map((entry) => [entry.subject, entry])
            );

            payload.subjectProgress = courseSubjects.map((subject) => {
                if (teacherSubjects.length > 0 && !teacherSubjects.includes(subject)) {
                    return existingBySubject.get(subject) ?? {
                        subject,
                        totalChapters: 0,
                        completedChapters: 0,
                    };
                }

                return requestedBySubject.get(subject) ?? existingBySubject.get(subject) ?? {
                    subject,
                    totalChapters: 0,
                    completedChapters: 0,
                };
            });
        }
    }

    const updated = await prisma.course.update({
        where: { id },
        data: payload,
    });

    return mapCourseRecord(updated);
};

export const deleteCourseRecord = async (id, currentUser = null) => {
    const existing = await prisma.course.findUnique({
        where: { id },
        select: {
            id: true,
            collegeId: true,
            classTeacherId: true,
            name: true,
            subjects: true,
        },
    });

    await assertCourseTeacherAccess(existing, currentUser, 'delete this class');
    return await prisma.course.delete({ where: { id } });
};

export const getCourseStudents = async (courseId, currentUser = null) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
            id: true,
            collegeId: true,
            classTeacherId: true,
            name: true,
            subjects: true,
        },
    });

    await assertCourseTeacherAccess(course, currentUser, 'view students for this class');
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

export const getCourseAssignments = async (courseId, currentUser = null) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: {
            id: true,
            collegeId: true,
            classTeacherId: true,
            name: true,
            subjects: true,
        },
    });

    await assertCourseTeacherAccess(course, currentUser, 'view assignments for this class');
    return await prisma.assignment.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' }
    });
};
