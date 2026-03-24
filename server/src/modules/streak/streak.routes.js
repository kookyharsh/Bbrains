import express from 'express';
import { getUserStreak, claimPoints } from './streak.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getUserStreak);
router.post('/claim', verifyToken, claimPoints);

export default router;
