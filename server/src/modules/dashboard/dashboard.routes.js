import express from 'express';
import { getAdminOverview, getDashboard } from './dashboard.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/', verifyToken, getDashboard);
router.get('/admin-overview', verifyToken, authorize('admin'), getAdminOverview);

export default router;
