import express from 'express';
import {
    createCourse, getCourses, getCourse, updateCourse,
    deleteCourse, listCourseStudents, listCourseAssignments
} from './course.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.post('/', verifyToken, authorize('teacher', 'admin', 'manager'), createCourse);
router.get('/', verifyToken, getCourses);
router.get('/:id', verifyToken, getCourse);
router.put('/:id', verifyToken, authorize('teacher', 'admin', 'manager'), updateCourse);
router.delete('/:id', verifyToken, authorize('admin', 'manager'), deleteCourse);
router.get('/:id/students', verifyToken, authorize('teacher', 'admin', 'manager'), listCourseStudents);
router.get('/:id/assignments', verifyToken, listCourseAssignments);

export default router;
