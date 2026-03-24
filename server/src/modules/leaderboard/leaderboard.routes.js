import express from 'express';
import { getLeaderboardHandler, getMyLeaderboardPosition, refreshLeaderboardHandler } from './leaderboard.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/', verifyToken, getLeaderboardHandler);
router.get('/me', verifyToken, getMyLeaderboardPosition);
router.post('/refresh', verifyToken, authorize('admin'), refreshLeaderboardHandler);

export default router;
