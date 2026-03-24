import express from 'express';
import { createAnnouncement, getAllAnnouncements, deleteAnnouncement } from './announcement.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllAnnouncements);
router.post('/', authorize('admin', 'teacher'), createAnnouncement);
router.delete('/:id', authorize('admin', 'teacher'), deleteAnnouncement);

export default router;
