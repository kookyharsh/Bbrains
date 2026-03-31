import express from 'express';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';
import {
    createAssessmentHandler,
    getAssessmentHandler,
    getAssessmentSetupHandler,
    getMyAssessmentResultsHandler,
    listTeacherAssessmentsHandler,
    updateAssessmentHandler,
} from './assessment.controller.js';

const router = express.Router();

router.get('/setup', verifyToken, authorize('teacher', 'admin'), getAssessmentSetupHandler);
router.get('/results/me', verifyToken, getMyAssessmentResultsHandler);
router.get('/', verifyToken, authorize('teacher', 'admin', 'manager'), listTeacherAssessmentsHandler);
router.get('/:id', verifyToken, authorize('teacher', 'admin', 'manager'), getAssessmentHandler);
router.post('/', verifyToken, authorize('teacher', 'admin'), createAssessmentHandler);
router.put('/:id', verifyToken, authorize('teacher', 'admin'), updateAssessmentHandler);

export default router;
