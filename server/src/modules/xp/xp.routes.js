import express from 'express';
import { getMyXp, getUserXp, awardXp, getLevels, adminCreateLevel, adminUpdateLevel, adminDeleteLevel } from './xp.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/me', verifyToken, getMyXp);
router.get('/levels', getLevels); // Public
router.post('/award', verifyToken, authorize('teacher', 'admin'), awardXp);
router.post('/levels', verifyToken, authorize('admin'), adminCreateLevel);
router.put('/levels/:levelNumber', verifyToken, authorize('admin'), adminUpdateLevel);
router.delete('/levels/:levelNumber', verifyToken, authorize('admin'), adminDeleteLevel);
router.get('/:userId', verifyToken, getUserXp);

export default router;
