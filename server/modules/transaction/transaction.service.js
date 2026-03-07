import prisma from '../../utils/prisma.js';

export const getTransactions = async (userId, filters = {}) => {
    const where = { userId };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
        where.transactionDate = {};
        if (filters.startDate) where.transactionDate.gte = new Date(filters.startDate);
        if (filters.endDate) where.transactionDate.lte = new Date(filters.endDate);
    }

    const skip = filters.skip || 0;
    const take = filters.take || 20;

    const [transactions, total] = await prisma.$transaction([
        prisma.transactionHistory.findMany({
            where,
            skip,
            take,
            orderBy: { transactionDate: 'desc' }
        }),
        prisma.transactionHistory.count({ where })
    ]);

    return { transactions, total };
};

export const getTransactionById = async (id) => {
    return await prisma.transactionHistory.findUnique({ where: { id } });
};

export const getUserTransactions = async (userId, skip = 0, take = 20) => {
    const [transactions, total] = await prisma.$transaction([
        prisma.transactionHistory.findMany({
            where: { userId },
            skip, take,
            orderBy: { transactionDate: 'desc' }
        }),
        prisma.transactionHistory.count({ where: { userId } })
    ]);
    return { transactions, total };
};
