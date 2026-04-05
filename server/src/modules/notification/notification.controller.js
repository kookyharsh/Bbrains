import { 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllAsRead, 
    getUnreadCount 
} from './notification.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const getStatusCode = (error, fallbackStatus = 500) => {
    if (typeof error?.statusCode === 'number') {
        return error.statusCode;
    }

    return fallbackStatus;
};

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit, offset, unreadOnly } = req.query;
        
        const notifications = await getUserNotifications(
            userId, 
            limit ? parseInt(limit) : 20, 
            offset ? parseInt(offset) : 0, 
            unreadOnly === 'true'
        );
        
        const unreadCount = await getUnreadCount(userId);
        
        return sendSuccess(res, { notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        return sendError(res, error?.message || 'Failed to fetch notifications', getStatusCode(error));
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        if (!id) return sendError(res, 'Notification ID is required', 400);
        
        const result = await markNotificationAsRead(userId, id);
        if (!result?.count) {
            return sendError(res, 'Notification not found', 404);
        }

        return sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
        console.error('Mark notification read error:', error);
        return sendError(res, error?.message || 'Failed to mark notification as read', getStatusCode(error));
    }
};

export const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await markAllAsRead(userId);
        return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
        console.error('Mark all read error:', error);
        return sendError(res, error?.message || 'Failed to mark all notifications as read', getStatusCode(error));
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await getUnreadCount(userId);
        return sendSuccess(res, { count });
    } catch (error) {
        console.error('Get unread count error:', error);
        return sendError(res, error?.message || 'Failed to get unread count', getStatusCode(error));
    }
};
