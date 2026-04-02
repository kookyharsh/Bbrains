import express from 'express';
import { register, login, logout, updatePassword } from './auth.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.put('/password', verifyToken, updatePassword);

export default router;