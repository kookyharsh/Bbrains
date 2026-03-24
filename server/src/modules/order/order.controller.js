import { getOrdersByUser, getOrderById, getAllOrders, updateOrderStatus } from './order.service.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

// GET /orders/me
export const getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const { orders, total } = await getOrdersByUser(req.user.id, (page - 1) * limit, limit);
        return sendPaginated(res, orders, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch orders', 500);
    }
};

// GET /orders/:id
export const getOrder = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid order ID', 400);

        const order = await getOrderById(id);
        if (!order) return sendError(res, 'Order not found', 404);

        if (order.userId !== req.user.id && req.user.type !== 'admin') {
            return sendError(res, 'Not authorized', 403);
        }

        return sendSuccess(res, order);
    } catch (error) {
        return sendError(res, 'Failed to fetch order', 500);
    }
};

// GET /orders (admin)
export const listAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const status = req.query.status || null;

        const { orders, total } = await getAllOrders((page - 1) * limit, limit, status);
        return sendPaginated(res, orders, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch orders', 500);
    }
};

// PUT /orders/:id/status
export const updateOrderStatusHandler = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid order ID', 400);

        const { status } = req.body;
        const validStatuses = ['pending', 'completed', 'cancelled', 'delivered'];
        if (!validStatuses.includes(status)) {
            return sendError(res, 'Invalid status. Must be one of: ' + validStatuses.join(', '), 400);
        }

        const order = await updateOrderStatus(id, status);
        await createAuditLog(req.user.id, 'MARKET', 'UPDATE_STATUS', 'Order', id, { status });
        return sendSuccess(res, order, 'Order status updated');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Order not found', 404);
        return sendError(res, 'Failed to update order status', 500);
    }
};
