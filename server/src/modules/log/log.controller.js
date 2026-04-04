import prisma from '../../utils/prisma.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';

// GET /logs/me
export const getMyLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const where = { userId: req.user.id };
        if (req.query.category) where.category = req.query.category;
        if (req.query.action) where.action = req.query.action;

        const [logs, total] = await prisma.$transaction([
            prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
            prisma.auditLog.count({ where })
        ]);

        return sendPaginated(res, logs, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch logs', 500);
    }
};

// GET /logs (admin)
export const getAllLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const where = {
            user: { collegeId: req.user.collegeId }
        };
        if (req.query.category) where.category = req.query.category;
        if (req.query.action) where.action = req.query.action;
        if (req.query.userId) where.userId = req.query.userId;
        if (req.query.entity) where.entity = req.query.entity;

        if (req.query.startDate || req.query.endDate) {
            where.createdAt = {};
            if (req.query.startDate) where.createdAt.gte = new Date(req.query.startDate);
            if (req.query.endDate) where.createdAt.lte = new Date(req.query.endDate);
        }

        const [logs, total] = await prisma.$transaction([
            prisma.auditLog.findMany({
                where, skip, take: limit,
                include: { user: { select: { username: true } } },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.auditLog.count({ where })
        ]);

        return sendPaginated(res, logs, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch logs', 500);
    }
};

// GET /logs/:id
export const getLogById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid log ID', 400);

        const log = await prisma.auditLog.findUnique({
            where: { id },
            include: { user: { select: { username: true, collegeId: true } } }
        });

        if (!log || log.user?.collegeId !== req.user.collegeId) return sendError(res, 'Log not found', 404);
        return sendSuccess(res, log);
    } catch (error) {
        return sendError(res, 'Failed to fetch log', 500);
    }
};

// GET /logs/stats
export const getLogStats = async (req, res) => {
    try {
        const where = { user: { collegeId: req.user.collegeId } };
        const [totalLogs, byCategory, byAction] = await Promise.all([
            prisma.auditLog.count({ where }),
            prisma.auditLog.groupBy({
                by: ['category'],
                where,
                _count: { _all: true }
            }),
            prisma.auditLog.groupBy({
                by: ['action'],
                where,
                _count: { _all: true },
                orderBy: { _count: { action: 'desc' } },
                take: 10
            })
        ]);

        return sendSuccess(res, {
            totalLogs,
            byCategory: byCategory.map(c => ({ category: c.category, count: c._count._all })),
            topActions: byAction.map(a => ({ action: a.action, count: a._count._all }))
        });
    } catch (error) {
        return sendError(res, 'Failed to fetch log stats', 500);
    }
};
