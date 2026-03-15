import express from 'express';
import { getMyTransactions, getTransaction, getUserTransactionsList } from './transaction.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/me', verifyToken, getMyTransactions);
router.get('/user/:userId', verifyToken, authorize('admin'), getUserTransactionsList);
router.get('/:id', verifyToken, getTransaction);

export default router;
