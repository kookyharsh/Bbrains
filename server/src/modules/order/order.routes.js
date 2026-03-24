import express from 'express';
import { getMyOrders, getOrder, listAllOrders, updateOrderStatusHandler } from './order.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/me', verifyToken, getMyOrders);
router.get('/all', verifyToken, authorize('admin'), listAllOrders);
router.get('/:id', verifyToken, getOrder);
router.put('/:id/status', verifyToken, authorize('admin'), updateOrderStatusHandler);

export default router;
