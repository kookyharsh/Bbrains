import prisma from "../../utils/prisma.js";

const getUserLogs = async (userId) => {
    return await prisma.userLogs.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' }
    });
};

export { getUserLogs };
