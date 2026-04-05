import prisma from '../../utils/prisma.js';

const ensureNotificationModelAvailable = (client = prisma) => {
    if (!client?.notification) {
        throw new Error("Prisma client for Notification model is not available. Ensure 'npx prisma generate' has run and migrations are up to date.");
    }
};

export const createNotification = async (userId, title, message, type, relatedId = null) => {
    ensureNotificationModelAvailable();
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
    ensureNotificationModelAvailable();
    const where = { userId };
    if (unreadOnly) {
        where.readAt = null;
    }

    return await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(Math.max(Number(limit) || 20, 1), 100),
        skip: Math.max(Number(offset) || 0, 0)
    });
};

export const markNotificationAsRead = async (userId, notificationId) => {
    ensureNotificationModelAvailable();
    return await prisma.notification.updateMany({
        where: {
            id: parseInt(notificationId),
            userId
        },
        data: { readAt: new Date() }
    });
};

export const markAllAsRead = async (userId) => {
    ensureNotificationModelAvailable();
    return await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() }
    });
};

export const getUnreadCount = async (userId) => {
    ensureNotificationModelAvailable();
    return await prisma.notification.count({
        where: { userId, readAt: null }
    });
};
