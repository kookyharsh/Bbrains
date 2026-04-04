import prisma from '../../utils/prisma.js';

export const getUpcomingEvents = async (take = 3, collegeId) => {
    return await prisma.event.findMany({
        where: {
            date: {
                gte: new Date(),
            },
            ...(collegeId ? { collegeId } : {})
        },
        orderBy: {
            date: 'asc',
        },
        take,
    });
};

export const createEventRecord = async (data) => {
    return await prisma.event.create({ data });
};

export const getAllEvents = async (collegeId) => {
    return await prisma.event.findMany({
        where: collegeId ? { collegeId } : {},
        orderBy: {
            date: 'asc',
        },
    });
};
