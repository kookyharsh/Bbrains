import express from 'express';
import { enroll, getEnrollments, getCourseEnrollmentsList, unenroll, updateGrade } from './enrollment.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.post('/', verifyToken, enroll);
router.get('/me', verifyToken, getEnrollments);
router.get('/course/:courseId', verifyToken, authorize('teacher', 'admin'), getCourseEnrollmentsList);
router.delete('/:userId/:courseId', verifyToken, unenroll);
router.put('/:userId/:courseId/grade', verifyToken, authorize('teacher', 'admin'), updateGrade);

export default router;
