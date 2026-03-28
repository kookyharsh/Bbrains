import prisma from '../../utils/prisma.js';

export const createRoleRecord = async (data) => {
    return await prisma.role.create({ data });
};

export const getAllRoles = async () => {
    return await prisma.role.findMany({
        include: { _count: { select: { users: true } } }
    });
};

export const updateRoleRecord = async (id, data) => {
    return await prisma.role.update({ where: { id }, data });
};

export const deleteRoleRecord = async (id) => {
    // Check if users are assigned
    const count = await prisma.userRoles.count({ where: { roleId: id } });
    if (count > 0) throw new Error('Cannot delete role with assigned users');
    return await prisma.role.delete({ where: { id } });
};

export const assignRoleToUser = async (userId, roleId) => {
    return await prisma.userRoles.create({
        data: { userId, roleId }
    });
};

export const removeRoleFromUser = async (userId, roleId) => {
    return await prisma.userRoles.delete({
        where: { userId_roleId: { userId, roleId } }
    });
};

export const getUserRoles = async (userId) => {
    return await prisma.userRoles.findMany({
        where: { userId },
        include: { role: true }
    });
};

export const getUsersWithRoles = async () => {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            username: true,
            email: true,
            type: true,
            userDetails: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    sex: true,
                    dob: true,
                    phone: true,
                    bio: true,
                }
            },
            roles: {
                select: {
                    role: true
                }
            }
        }
    });
};
