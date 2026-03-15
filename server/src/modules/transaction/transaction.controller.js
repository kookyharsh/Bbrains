import { getTransactions, getTransactionById, getUserTransactions } from './transaction.service.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';

// GET /transactions/me
export const getMyTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const filters = {
            type: req.query.type,
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            skip: (page - 1) * limit,
            take: limit
        };

        const { transactions, total } = await getTransactions(req.user.id, filters);
        return sendPaginated(res, transactions, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch transactions', 500);
    }
};

// GET /transactions/:id
export const getTransaction = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid transaction ID', 400);

        const transaction = await getTransactionById(id);
        if (!transaction) return sendError(res, 'Transaction not found', 404);

        // Check ownership
        if (transaction.userId !== req.user.id && req.user.type !== 'admin') {
            return sendError(res, 'Not authorized', 403);
        }

        return sendSuccess(res, transaction);
    } catch (error) {
        return sendError(res, 'Failed to fetch transaction', 500);
    }
};

// GET /transactions/user/:userId (admin only)
export const getUserTransactionsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);

        const { transactions, total } = await getUserTransactions(req.params.userId, (page - 1) * limit, limit);
        return sendPaginated(res, transactions, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch transactions', 500);
    }
};
