import express from 'express';
import { gradeSubmission, getMyGrades, getStudentGrades, updateGrade, getAssignmentGrades } from './grade.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.post('/', verifyToken, authorize('teacher', 'admin'), gradeSubmission);
router.get('/me', verifyToken, getMyGrades);
router.get('/student/:userId', verifyToken, authorize('teacher', 'admin'), getStudentGrades);
router.put('/:id', verifyToken, authorize('teacher', 'admin'), updateGrade);
router.get('/assignment/:assignmentId', verifyToken, authorize('teacher', 'admin'), getAssignmentGrades);

export default router;
