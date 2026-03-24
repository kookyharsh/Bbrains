import prisma from '../../utils/prisma.js';

// Create user details
export const createUserDetailsRecord = async (userId, data) => {
    return await prisma.userDetails.create({
        data: {
            userId,
            ...data,
            dob: new Date(data.dob)
        }
    });
};

// Get user details by user ID
export const getUserDetailsById = async (userId) => {
    return await prisma.userDetails.findUnique({
        where: { userId },
        include: {
            address: true
        }
    });
};

// Update user details
export const updateUserDetailsRecord = async (userId, data) => {
    const updateData = { ...data };
    if (data.dob) updateData.dob = new Date(data.dob);

    return await prisma.userDetails.update({
        where: { userId },
        data: updateData
    });
};
