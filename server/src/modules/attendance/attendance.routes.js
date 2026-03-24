import express from 'express';
import { getAttendance, getStudentAttendance, markAttendance } from './attendance.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/', verifyToken, getAttendance);
// Teacher/Admin: get attendance for a specific student
router.get('/student/:studentId', verifyToken, authorize('teacher', 'admin'), getStudentAttendance);
// Mark attendance for a student
router.post('/mark', verifyToken, authorize('teacher', 'admin'), markAttendance);

export default router;
