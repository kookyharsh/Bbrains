import express from 'express';
import { getConfigs, updateConfig, removeConfig, getPublicConfigs } from './config.controller.js';
import verifyToken from '../../middleware/verifyToken.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicConfigs);

// Admin-only routes
router.get('/', verifyToken, authorize('admin'), getConfigs);
router.post('/', verifyToken, authorize('admin'), updateConfig);
router.delete('/:key', verifyToken, authorize('admin'), removeConfig);

export default router;
