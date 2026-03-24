import express from 'express';
import { createCollege, getColleges, getCollege, updateCollege, deleteCollege } from './college.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.post('/', verifyToken, authorize('admin'), createCollege);
router.get('/', verifyToken, getColleges);
router.get('/:id', verifyToken, getCollege);
router.put('/:id', verifyToken, authorize('admin'), updateCollege);
router.delete('/:id', verifyToken, authorize('admin'), deleteCollege);

export default router;
