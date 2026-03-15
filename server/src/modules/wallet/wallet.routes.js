import express from 'express';
import {
    getWalletHandler, getBalance, setupPin, changePin,
    verifyPin, transferHandler, getHistoryHandler
} from './wallet.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me', verifyToken, getWalletHandler);
router.get('/balance', verifyToken, getBalance);
router.post('/setup', verifyToken, setupPin);
router.put('/pin', verifyToken, changePin);
router.post('/verify-pin', verifyToken, verifyPin);
router.post('/transfer', verifyToken, transferHandler);
router.get('/history', verifyToken, getHistoryHandler);

export default router;
