import express from 'express';
import { createAddress, getMyAddresses, updateAddress, deleteAddress } from './address.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createAddress);
router.get('/me', verifyToken, getMyAddresses);
router.put('/:id', verifyToken, updateAddress);
router.delete('/:id', verifyToken, deleteAddress);

export default router;
