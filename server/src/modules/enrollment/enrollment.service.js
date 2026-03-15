import prisma from '../../utils/prisma.js';

export const enrollUser = async (userId, courseId) => {
    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
    });
    if (existing) throw new Error('Already enrolled in this course');

    return await prisma.enrollment.create({
        data: { userId, courseId }
    });
};

export const getMyEnrollments = async (userId) => {
    return await prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                include: { _count: { select: { assignments: true } } }
            }
        }
    });
};

export const getCourseEnrollments = async (courseId) => {
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

export const unenrollUser = async (userId, courseId) => {
    return await prisma.enrollment.delete({
        where: { userId_courseId: { userId, courseId } }
    });
};

export const updateEnrollmentGrade = async (userId, courseId, grade) => {
    return await prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: { grade }
    });
};
