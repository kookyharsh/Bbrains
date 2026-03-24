import prisma from '../../utils/prisma.js';

export const createNotification = async (userId, title, message, type, relatedId = null) => {
    return await prisma.notification.create({
        data: {
            userId,
            title,
            message,
            type,
            relatedId
        }
    });
};

export const getUserNotifications = async (userId, limit = 20, offset = 0, unreadOnly = false) => {
    // Guard against missing Prisma model exposure (e.g., after schema changes without regenerating the client)
    if (!prisma?.notification?.findMany) {
        throw new Error("Prisma client for Notification model is not available. Ensure 'npx prisma generate' has run and migrations are up to date.");
    }
    const where = { userId };
    if (unreadOnly) {
        where.readAt = null;
    }

    return await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    });
};

export const markNotificationAsRead = async (userId, notificationId) => {
    return await prisma.notification.update({
        where: { id: parseInt(notificationId), userId },
        data: { readAt: new Date() }
    });
};

export const markAllAsRead = async (userId) => {
    return await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() }
    });
};

export const getUnreadCount = async (userId) => {
    return await prisma.notification.count({
        where: { userId, readAt: null }
    });
};
