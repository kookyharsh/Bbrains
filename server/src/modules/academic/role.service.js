import prisma from '../../utils/prisma.js';

export const createRoleRecord = async (data) => {
    return await prisma.role.create({ data });
};

export const getAllRoles = async (collegeId = null) => {
    return await prisma.role.findMany({
        where: collegeId ? {
            OR: [
                { collegeId: collegeId },
                { collegeId: null }
            ]
        } : {},
        include: {
            _count: { select: { users: true } },
            permissions: {
                include: {
                    permission: true
                }
            }
        },
        orderBy: { rank: 'asc' }
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
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            }
        }
    });
};

export const updateRolePermissions = async (roleId, permissionIds) => {
    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
        // Delete existing permissions for this role
        await tx.rolePermission.deleteMany({
            where: { roleId }
        });

        // Add new permissions
        if (permissionIds.length > 0) {
            await tx.rolePermission.createMany({
                data: permissionIds.map(pId => ({
                    roleId,
                    permissionId: pId
                }))
            });
        }

        return await tx.role.findUnique({
            where: { id: roleId },
            include: { permissions: { include: { permission: true } } }
        });
    });
};

export const getAllPermissions = async () => {
    return await prisma.permission.findMany({
        orderBy: { name: 'asc' }
    });
};

export const getHighestRank = (user) => {
    if (user.isSuperAdmin) return 0;
    if (!user.roles || user.roles.length === 0) return 1000; // Lowest priority
    return Math.min(...user.roles.map(ur => ur.role.rank));
};

export const canManageRole = (currentUser, targetRole) => {
    if (currentUser.isSuperAdmin) return true;
    
    const userRank = getHighestRank(currentUser);
    // User can only manage roles with a strictly higher rank number (lower priority)
    return userRank < targetRole.rank;
};
