import express from 'express';
import {
    createAssignmentHandler, getAssignmentsHandler, getAssignmentHandler,
    updateAssignmentHandler, deleteAssignmentHandler,
    submitAssignmentHandler, getSubmissionsHandler,
    createAnnouncementHandler, getAnnouncementsHandler, deleteAnnouncementHandler
} from './academic.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Assignments
router.post('/assignments', verifyToken, authorize('teacher', 'admin'), createAssignmentHandler);
router.get('/assignments', verifyToken, getAssignmentsHandler);
router.get('/assignments/:id', verifyToken, getAssignmentHandler);
router.put('/assignments/:id', verifyToken, authorize('teacher', 'admin'), updateAssignmentHandler);
router.delete('/assignments/:id', verifyToken, authorize('teacher', 'admin'), deleteAssignmentHandler);

// Submissions
router.post('/submissions', verifyToken, submitAssignmentHandler);
router.get('/submissions/:assignmentId', verifyToken, authorize('teacher', 'admin'), getSubmissionsHandler);

// Announcements
router.post('/announcements', verifyToken, authorize('teacher', 'admin'), createAnnouncementHandler);
router.get('/announcements', verifyToken, getAnnouncementsHandler);
router.delete('/announcements/:id', verifyToken, authorize('teacher', 'admin'), deleteAnnouncementHandler);

export default router;
