import express from 'express';
import {
    getMe, getUserByUsername, getStudents, getTeachers, getStaff,
    getStudentByUsername, getTeacherByUsername,
    addTeacher, addStudent, addManager, getManagers, updateTeacher, updateStudent, deleteTeacher, searchUser
} from './user_management.controller.js';
import { editUser, removeUser, dailyClaim } from './user_actions.controller.js';
import { createDetails, getMyDetails, updateMyDetails, getUserDetails } from './userDetails.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Profile
router.get('/me', verifyToken, getMe);
router.get('/search', verifyToken, searchUser);

// User Details
router.post('/me/details', verifyToken, createDetails);
router.get('/me/details', verifyToken, getMyDetails);
router.put('/me/details', verifyToken, updateMyDetails);
router.get('/:id/details', verifyToken, authorize('teacher', 'admin', 'manager'), getUserDetails);

// Student endpoints
router.get('/students', verifyToken, authorize('teacher', 'admin', 'staff', 'manager'), getStudents);
router.get('/students/:username', verifyToken, authorize('teacher', 'admin', 'staff', 'manager'), getStudentByUsername);
router.get('/staff', verifyToken, authorize('admin', 'manager'), getStaff);
router.post('/students', verifyToken, authorize('admin', 'manager'), addStudent);
router.put('/students/:id', verifyToken, authorize('admin', 'manager'), updateStudent);

// Teacher endpoints
router.get('/teachers', verifyToken, getTeachers);
router.get('/teachers/:username', verifyToken, getTeacherByUsername);
router.post('/teachers', verifyToken, authorize('admin', 'manager'), addTeacher);
router.put('/teachers/:id', verifyToken, authorize('admin', 'manager'), updateTeacher);
router.delete('/teachers/:id', verifyToken, authorize('admin', 'manager'), deleteTeacher);

// Manager endpoints
router.get('/managers', verifyToken, authorize('admin'), getManagers);
router.post('/managers', verifyToken, authorize('admin'), addManager);

// User actions
router.put('/update/:id', verifyToken, editUser);
router.delete('/delete/:id', verifyToken, authorize('admin', 'manager'), removeUser);
router.post('/claim-daily', verifyToken, dailyClaim);

// Get user by username (must be LAST due to :username param matching)
router.get('/:username', verifyToken, getUserByUsername);

export default router;
