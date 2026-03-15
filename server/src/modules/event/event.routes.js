import express from 'express';
import { getUpcoming, createEvent, getEvents } from './event.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/upcoming', verifyToken, getUpcoming);
router.get('/', verifyToken, getEvents);
router.post('/', verifyToken, authorize('teacher', 'admin', 'staff'), createEvent);

export default router;
