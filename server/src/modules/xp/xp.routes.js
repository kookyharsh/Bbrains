import express from 'express';
import { getMyXp, getUserXp, awardXp, getLevels } from './xp.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/me', verifyToken, getMyXp);
router.get('/levels', getLevels); // Public
router.post('/award', verifyToken, authorize('teacher', 'admin'), awardXp);
router.get('/:userId', verifyToken, getUserXp);

export default router;
