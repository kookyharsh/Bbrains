import prisma from '../../utils/prisma.js';

export const createSuggestionRecord = async (userId, title, content) => {
    return await prisma.suggestion.create({
        data: { userId, title, content }
    });
};

export const getSuggestionsByFilters = async (filters = {}) => {
    const { userId, status } = filters;
    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    return await prisma.suggestion.findMany({
        where,
        include: {
            user: {
                select: {
                    username: true,
                    userDetails: {
                        select: { firstName: true, lastName: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const updateSuggestionStatus = async (id, status) => {
    return await prisma.suggestion.update({
        where: { id: parseInt(id) },
        data: { status }
    });
};

export const deleteSuggestion = async (id, userId) => {
    // Only allow user to delete their own or admin to delete any
    const where = { id: parseInt(id) };
    if (userId) where.userId = userId;
    
    return await prisma.suggestion.delete({ where });
};
