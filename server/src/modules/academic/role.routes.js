import express from 'express';
import { 
    createRole, getRoles, updateRole, deleteRole, 
    assignRole, removeRole, listUserRoles,
    listPermissions, updatePermissions, getUsersWithRoles
} from './role.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize, { checkPermission } from '../../middleware/authorize.js';

const router = express.Router();

// Permissions list
router.get('/permissions', verifyToken, authorize('admin'), listPermissions);

// Roles with Users
router.get('/users', verifyToken, authorize('admin'), getUsersWithRoles);

// Role CRUD (admin only)
router.post('/', verifyToken, authorize('admin'), checkPermission('manage_roles'), createRole);
router.get('/', verifyToken, authorize('admin'), getRoles);
router.put('/:id', verifyToken, authorize('admin'), checkPermission('manage_roles'), updateRole);
router.delete('/:id', verifyToken, authorize('admin'), checkPermission('manage_roles'), deleteRole);

// Role Permissions
router.post('/:id/permissions', verifyToken, authorize('admin'), checkPermission('manage_permissions'), updatePermissions);

// User role management (admin only, except viewing own)
router.post('/users/:userId/assign', verifyToken, authorize('admin'), checkPermission('manage_roles'), assignRole);
router.delete('/users/:userId/:roleId', verifyToken, authorize('admin'), checkPermission('manage_roles'), removeRole);
router.get('/users/:userId', verifyToken, listUserRoles);

export default router;
