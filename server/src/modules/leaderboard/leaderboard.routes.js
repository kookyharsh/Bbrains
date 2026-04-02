import express from 'express';
import { getLeaderboardHandler, getMyLeaderboardPosition } from './leaderboard.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getLeaderboardHandler);
router.get('/me', verifyToken, getMyLeaderboardPosition);

export default router;
