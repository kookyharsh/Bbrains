import express from 'express';
import { createCollege, getColleges, getCollege, updateCollege, deleteCollege } from './college.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Only Super Admin can create colleges
router.post('/', verifyToken, authorize('super_admin'), createCollege);

// Only Super Admin can see ALL colleges
router.get('/', verifyToken, authorize('super_admin'), getColleges);

// Admins can see their own college, Super Admin can see any
router.get('/:id', verifyToken, authorize('admin'), getCollege);

// Admins can update their own college
router.put('/:id', verifyToken, authorize('admin'), updateCollege);

// Only Super Admin can delete colleges
router.delete('/:id', verifyToken, authorize('super_admin'), deleteCollege);

export default router;
