import crypto from 'crypto';
import prisma from '../../utils/prisma.js';

const transactionUserSelect = {
    id: true,
    username: true,
    type: true,
    collegeId: true,
    userDetails: {
        select: {
            firstName: true,
            lastName: true,
        },
    },
    roles: {
        select: {
            role: {
                select: {
                    name: true,
                },
            },
        },
    },
};

const hasManagerRole = (user) => Boolean(
    user?.roles?.some((entry) => entry?.role?.name?.toLowerCase().includes('manager'))
);

const toTransactionDate = (value) => {
    const parsed = value ? new Date(value) : new Date();
    if (Number.isNaN(parsed.getTime())) {
        throw new Error('Invalid payment date');
    }
    return parsed;
};

const withAmount = (transaction, userMap) => ({
    ...transaction,
    amount: Number(transaction.amount || 0),
    user: userMap.get(transaction.userId) || null,
    relatedUser: transaction.relatedUserId ? userMap.get(transaction.relatedUserId) || null : null,
    recordedByUser: transaction.recordedById ? userMap.get(transaction.recordedById) || null : null,
});

const hydrateTransactions = async (transactions) => {
    if (!transactions.length) return [];

    const userIds = Array.from(new Set(
        transactions
            .flatMap((transaction) => [transaction.userId, transaction.relatedUserId, transaction.recordedById])
            .filter(Boolean)
    ));

    const users = userIds.length > 0
        ? await prisma.user.findMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            select: transactionUserSelect,
        })
        : [];

    const userMap = new Map(users.map((user) => [user.id, user]));
    return transactions.map((transaction) => withAmount(transaction, userMap));
};

const applyFilters = (where, filters = {}) => {
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.primaryOnly === true) where.primaryRecord = true;

    if (filters.startDate || filters.endDate) {
        where.transactionDate = {};
        if (filters.startDate) where.transactionDate.gte = new Date(filters.startDate);
        if (filters.endDate) where.transactionDate.lte = new Date(filters.endDate);
    }
};

export const getTransactions = async (userId, filters = {}, scope = 'owner') => {
    const where = scope === 'recorded'
        ? {
            recordedById: userId,
            primaryRecord: true,
        }
        : {
            userId,
        };

    applyFilters(where, filters);

    const skip = filters.skip || 0;
    const take = filters.take || 20;

    const [transactions, total] = await prisma.$transaction([
        prisma.transactionHistory.findMany({
            where,
            skip,
            take,
            orderBy: { transactionDate: 'desc' },
        }),
        prisma.transactionHistory.count({ where }),
    ]);

    return {
        transactions: await hydrateTransactions(transactions),
        total,
    };
};

export const getRecordedTransactionsForActor = async (actor, filters = {}) => {
    if (!actor?.id) {
        return {
            transactions: [],
            total: 0,
        };
    }

    let recordedByIds = [actor.id];

    if (actor.type === 'admin') {
        const recorders = await prisma.user.findMany({
            where: {
                ...(actor.collegeId ? { collegeId: actor.collegeId } : {}),
                OR: [
                    { type: 'admin' },
                    {
                        roles: {
                            some: {
                                role: {
                                    name: {
                                        contains: 'manager',
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
            },
        });

        recordedByIds = recorders.map((user) => user.id);
    }

    if (recordedByIds.length === 0) {
        return {
            transactions: [],
            total: 0,
        };
    }

    const where = {
        recordedById: {
            in: recordedByIds,
        },
        primaryRecord: true,
    };

    applyFilters(where, filters);

    const skip = filters.skip || 0;
    const take = filters.take || 20;

    const [transactions, total] = await prisma.$transaction([
        prisma.transactionHistory.findMany({
            where,
            skip,
            take,
            orderBy: { transactionDate: 'desc' },
        }),
        prisma.transactionHistory.count({ where }),
    ]);

    return {
        transactions: await hydrateTransactions(transactions),
        total,
    };
};

export const getTransactionById = async (id) => {
    const transaction = await prisma.transactionHistory.findUnique({ where: { id } });
    if (!transaction) return null;

    const [hydrated] = await hydrateTransactions([transaction]);
    return hydrated || null;
};

export const getUserTransactions = async (userId, skip = 0, take = 20, filters = {}) => {
    const where = { userId };
    applyFilters(where, filters);

    const [transactions, total] = await prisma.$transaction([
        prisma.transactionHistory.findMany({
            where,
            skip,
            take,
            orderBy: { transactionDate: 'desc' },
        }),
        prisma.transactionHistory.count({ where }),
    ]);

    return {
        transactions: await hydrateTransactions(transactions),
        total,
    };
};

const buildSalaryNotes = (actor, target, customNote) => {
    const suffix = customNote ? ` - ${customNote}` : '';
    return {
        primary: `Salary paid to @${target.username}${suffix}`,
        mirror: `Salary received from @${actor.username}${suffix}`,
    };
};

const buildFeeNotes = (actor, student, customNote, financeOwner) => {
    const suffix = customNote ? ` - ${customNote}` : '';
    const recorderSuffix = actor.id !== financeOwner.id ? ` (recorded by @${actor.username})` : '';

    return {
        primary: `Fee received from @${student.username}${recorderSuffix}${suffix}`,
        mirror: `Fee paid to institution${suffix}`,
    };
};

const resolveFinanceOwner = async (tx, actor) => {
    if (actor.type === 'admin') {
        return {
            id: actor.id,
            username: actor.username,
            type: actor.type,
        };
    }

    const collegeAdmin = await tx.user.findFirst({
        where: {
            collegeId: actor.collegeId,
            type: 'admin',
        },
        orderBy: {
            createdAt: 'asc',
        },
        select: {
            id: true,
            username: true,
            type: true,
        },
    });

    if (!collegeAdmin) {
        throw new Error('No admin account is available for this college to receive fee income');
    }

    return collegeAdmin;
};

const assertSalaryPermissions = (actor, target) => {
    if (target.id === actor.id) {
        throw new Error('You cannot record a salary payment to yourself');
    }

    if (target.type === 'student') {
        throw new Error('Salary can only be recorded for teachers, managers, or staff');
    }

    if (target.type === 'admin' || target.type === 'superadmin') {
        throw new Error('Salary payments cannot be recorded for admin accounts');
    }

    if (hasManagerRole(actor) && actor.type !== 'admin' && hasManagerRole(target)) {
        throw new Error('Managers can pay salary to teachers and staff, but not to managers');
    }
};

export const createManualTransactionRecord = async (actor, payload) => {
    return await prisma.$transaction(async (tx) => {
        const targetUser = await tx.user.findUnique({
            where: { id: payload.targetUserId },
            select: transactionUserSelect,
        });

        if (!targetUser) {
            throw new Error('Selected user was not found');
        }

        const transactionDate = toTransactionDate(payload.paymentDate);
        const amount = Number(payload.amount);
        const paymentMode = payload.paymentMode || null;
        const referenceId = payload.referenceId?.trim() || null;
        const cleanNote = payload.note?.trim() || '';
        const entryGroupId = crypto.randomUUID();

        if (!(amount > 0)) {
            throw new Error('Transaction amount must be greater than zero');
        }

        let primaryRecord;

        if (payload.category === 'salary') {
            assertSalaryPermissions(actor, targetUser);
            const notes = buildSalaryNotes(actor, targetUser, cleanNote);

            primaryRecord = await tx.transactionHistory.create({
                data: {
                    userId: actor.id,
                    recordedById: actor.id,
                    relatedUserId: targetUser.id,
                    entryGroupId,
                    transactionDate,
                    amount,
                    type: 'debit',
                    category: 'salary',
                    status: 'success',
                    paymentMode,
                    referenceId,
                    primaryRecord: true,
                    note: notes.primary,
                },
            });

            await tx.transactionHistory.create({
                data: {
                    userId: targetUser.id,
                    recordedById: actor.id,
                    relatedUserId: actor.id,
                    entryGroupId,
                    transactionDate,
                    amount,
                    type: 'credit',
                    category: 'salary',
                    status: 'success',
                    paymentMode,
                    referenceId,
                    primaryRecord: false,
                    note: notes.mirror,
                },
            });
        } else if (payload.category === 'fee') {
            if (targetUser.type !== 'student') {
                throw new Error('Fee records can only be created for students');
            }

            const financeOwner = await resolveFinanceOwner(tx, actor);
            const notes = buildFeeNotes(actor, targetUser, cleanNote, financeOwner);

            primaryRecord = await tx.transactionHistory.create({
                data: {
                    userId: financeOwner.id,
                    recordedById: actor.id,
                    relatedUserId: targetUser.id,
                    entryGroupId,
                    transactionDate,
                    amount,
                    type: 'credit',
                    category: 'fee',
                    status: 'success',
                    paymentMode,
                    referenceId,
                    primaryRecord: true,
                    note: notes.primary,
                },
            });

            await tx.transactionHistory.create({
                data: {
                    userId: targetUser.id,
                    recordedById: actor.id,
                    relatedUserId: financeOwner.id,
                    entryGroupId,
                    transactionDate,
                    amount,
                    type: 'debit',
                    category: 'fee',
                    status: 'success',
                    paymentMode,
                    referenceId,
                    primaryRecord: false,
                    note: notes.mirror,
                },
            });
        } else {
            throw new Error('Unsupported transaction category');
        }

        const [hydrated] = await hydrateTransactions([primaryRecord]);
        return hydrated || null;
    });
};
