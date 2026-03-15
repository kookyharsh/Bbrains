import { 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllAsRead, 
    getUnreadCount 
} from './notification.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

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
        return sendError(res, 'Failed to fetch notifications', 500);
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        if (!id) return sendError(res, 'Notification ID is required', 400);
        
        await markNotificationAsRead(userId, id);
        return sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
        console.error('Mark notification read error:', error);
        return sendError(res, 'Failed to mark notification as read', 500);
    }
};

export const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await markAllAsRead(userId);
        return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
        console.error('Mark all read error:', error);
        return sendError(res, 'Failed to mark all notifications as read', 500);
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await getUnreadCount(userId);
        return sendSuccess(res, { count });
    } catch (error) {
        console.error('Get unread count error:', error);
        return sendError(res, 'Failed to get unread count', 500);
    }
};
