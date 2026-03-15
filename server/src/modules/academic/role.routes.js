import express from 'express';
import { createRole, getRoles, updateRole, deleteRole, assignRole, removeRole, listUserRoles } from './role.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Role CRUD (admin only)
router.post('/', verifyToken, authorize('admin'), createRole);
router.get('/', verifyToken, authorize('admin'), getRoles);
router.put('/:id', verifyToken, authorize('admin'), updateRole);
router.delete('/:id', verifyToken, authorize('admin'), deleteRole);

// User role management (admin only, except viewing own)
router.post('/users/:userId/assign', verifyToken, authorize('admin'), assignRole);
router.delete('/users/:userId/:roleId', verifyToken, authorize('admin'), removeRole);
router.get('/users/:userId', verifyToken, listUserRoles);

export default router;
