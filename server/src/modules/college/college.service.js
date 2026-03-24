import prisma from '../../utils/prisma.js';

// Create college
export const createCollegeRecord = async (data) => {
    return await prisma.college.create({ data });
};

// Get all colleges with pagination
export const getAllColleges = async (skip = 0, take = 20) => {
    const [colleges, total] = await prisma.$transaction([
        prisma.college.findMany({
            skip,
            take,
            include: { address: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.college.count()
    ]);
    return { colleges, total };
};

// Get college by ID
export const getCollegeById = async (id) => {
    return await prisma.college.findUnique({
        where: { id },
        include: { address: true }
    });
};

// Update college
export const updateCollegeRecord = async (id, data) => {
    return await prisma.college.update({
        where: { id },
        data
    });
};

// Delete college (hard delete since schema has no deletedAt)
export const deleteCollegeRecord = async (id) => {
    return await prisma.college.delete({
        where: { id }
    });
};
