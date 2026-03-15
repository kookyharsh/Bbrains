import prisma from '../../utils/prisma.js';
import { awardXpToUser } from '../xp/xp.service.js';
import { createNotification } from '../notification/notification.service.js';

export const createGradeRecord = async (data, tx = null) => {
    const client = tx || prisma;
    const grade = await client.grade.create({ 
        data,
        include: {
            assignment: { select: { title: true } }
        }
    });

    // Award XP for completing an assignment (graded)
    // Award dynamic XP based on the grade value
    let xpAward = 50; // Default
    const g = grade.grade.toUpperCase();
    if (g === 'A+') xpAward = 100;
    else if (g === 'A') xpAward = 80;
    else if (g === 'B+') xpAward = 60;
    else if (g === 'B') xpAward = 50;
    else if (g === 'C') xpAward = 40;

    await awardXpToUser(grade.userId, xpAward);

    // Notify student
    await createNotification(
        grade.userId,
        'Assignment Graded',
        `Your submission for "${grade.assignment.title}" has been graded: ${grade.grade}`,
        'grade',
        grade.id.toString()
    );

    return grade;
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
