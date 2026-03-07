import prisma from '../../utils/prisma.js';

export const createCourseRecord = async (data) => {
    return await prisma.course.create({ data });
};

export const getAllCourses = async (skip = 0, take = 20) => {
    const [courses, total] = await prisma.$transaction([
        prisma.course.findMany({
            skip, take,
            include: { _count: { select: { enrollments: true, assignments: true } } }
        }),
        prisma.course.count()
    ]);
    return { courses, total };
};

export const getCourseById = async (id) => {
    return await prisma.course.findUnique({
        where: { id },
        include: {
            assignments: { orderBy: { createdAt: 'desc' } },
            _count: { select: { enrollments: true } }
        }
    });
};

export const updateCourseRecord = async (id, data) => {
    return await prisma.course.update({ where: { id }, data });
};

export const deleteCourseRecord = async (id) => {
    return await prisma.course.delete({ where: { id } });
};

export const getCourseStudents = async (courseId) => {
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
