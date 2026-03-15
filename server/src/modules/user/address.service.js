import prisma from '../../utils/prisma.js';

// Create address
export const createAddressRecord = async (data) => {
    return await prisma.address.create({ data });
};

// Get addresses for a user
export const getAddressesByUserId = async (userId) => {
    return await prisma.address.findMany({
        where: { userId }
    });
};

// Get address by ID
export const getAddressById = async (id) => {
    return await prisma.address.findUnique({
        where: { id }
    });
};

// Update address
export const updateAddressRecord = async (id, data) => {
    return await prisma.address.update({
        where: { id },
        data
    });
};

// Delete address
export const deleteAddressRecord = async (id) => {
    return await prisma.address.delete({
        where: { id }
    });
};
