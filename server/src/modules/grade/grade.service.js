import prisma from '../../utils/prisma.js';

export const createGradeRecord = async (data, tx = null) => {
    const client = tx || prisma;
    return await client.grade.create({ data });
};

export const getGradesByUser = async (userId) => {
    return await prisma.grade.findMany({
        where: { userId },
        include: {
            assignment: { select: { title: true, courseId: true, course: { select: { name: true } } } }
        },
        orderBy: { gradedAt: 'desc' }
    });
};

export const getGradesByStudent = async (userId) => {
    return await prisma.grade.findMany({
        where: { userId },
        include: {
            assignment: { select: { title: true, courseId: true } }
        },
        orderBy: { gradedAt: 'desc' }
    });
};

export const updateGradeRecord = async (id, data) => {
    return await prisma.grade.update({
        where: { id },
        data
    });
};

export const getGradesByAssignment = async (assignmentId) => {
    return await prisma.grade.findMany({
        where: { assignmentId },
        include: {
            user: { select: { username: true, email: true, userDetails: { select: { firstName: true, lastName: true } } } }
        }
    });
};

export const getGradeById = async (id) => {
    return await prisma.grade.findUnique({
        where: { id },
        include: { assignment: true, user: { select: { id: true, username: true } } }
    });
};
