import prisma from '../../utils/prisma.js';

export const getAttendanceRecords = async (userId, startDate, endDate) => {
    return await prisma.attendance.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
};
