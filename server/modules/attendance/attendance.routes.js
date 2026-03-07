import express from 'express';
import { getAttendance } from './attendance.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getAttendance);

export default router;
