import prisma from '../../utils/prisma.js';

export const getUpcomingEvents = async (take = 3) => {
    return await prisma.event.findMany({
        where: {
            date: {
                gte: new Date(),
            },
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

export const getAllEvents = async () => {
    return await prisma.event.findMany({
        orderBy: {
            date: 'asc',
        },
    });
};
