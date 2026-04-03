import express from 'express';
import { createAnnouncement, getAllAnnouncements, deleteAnnouncement, acknowledgeAnnouncement, getAcknowledgedUsers } from './announcement.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllAnnouncements);
router.post('/', authorize('admin', 'teacher', 'manager'), createAnnouncement);
router.delete('/:id', authorize('admin', 'teacher'), deleteAnnouncement);
router.post('/:id/acknowledge', acknowledgeAnnouncement);
router.get('/:id/acknowledged', getAcknowledgedUsers);

export default router;
