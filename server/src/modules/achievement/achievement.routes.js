import express from 'express';
import {
    createAchievement, getAchievements, getAchievement, updateAchievement,
    deleteAchievementHandler, getMyAchievements, getUserAchievementsList, manualUnlock
} from './achievement.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/me', verifyToken, getMyAchievements);
router.get('/user/:userId', verifyToken, getUserAchievementsList);
router.post('/', verifyToken, authorize('bbrains_official'), createAchievement);
router.get('/', verifyToken, getAchievements);
router.get('/:id', verifyToken, getAchievement);
router.put('/:id', verifyToken, authorize('bbrains_official'), updateAchievement);
router.delete('/:id', verifyToken, authorize('bbrains_official'), deleteAchievementHandler);
router.post('/:id/unlock/:userId', verifyToken, authorize('bbrains_official'), manualUnlock);

export default router;
