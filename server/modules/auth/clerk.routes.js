import express from 'express';
import { handleClerkWebhook } from './clerk.controller.js';

const router = express.Router();

// Webhook requires raw body for Svix signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default router;
