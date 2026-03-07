import { Webhook } from 'svix';
import { createUser, findUserByClerkId } from '../user/user.service.js';
import { createAuditLog } from '../../utils/auditLog.js';
import { createClerkClient } from '@clerk/backend';
import dotenv from 'dotenv';
dotenv.config();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const handleClerkWebhook = async (req, res) => {
    try {
        const payloadString = req.body.toString('utf8');
        const headerPayload = req.headers;
        const svix_id = headerPayload['svix-id'];
        const svix_timestamp = headerPayload['svix-timestamp'];
        const svix_signature = headerPayload['svix-signature'];

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ error: 'Missing svix headers' });
        }

        // Add CLERK_WEBHOOK_SECRET to your .env
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('CLERK_WEBHOOK_SECRET is not configured');
            return res.status(500).json({ error: 'Server misconfiguration' });
        }

        const wb = new Webhook(webhookSecret);
        let evt;

        try {
            evt = wb.verify(payloadString, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            });
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return res.status(400).json({ error: 'Webhook verification failed' });
        }

        const { id } = evt.data;
        const eventType = evt.type;

        if (eventType === 'user.created') {
            console.log(`Clerk Webhook: User ${id} was created`);

            const existingUser = await findUserByClerkId(id);
            if (existingUser) {
                console.log(`User ${id} already exists in DB. Skipping creation.`);
                return res.status(200).json({ success: true, message: 'User already exists' });
            }

            const email = evt.data.email_addresses?.[0]?.email_address || '';
            const username = evt.data.username || email.split('@')[0] || `user_${id.slice(-5)}`;
            const firstName = evt.data.first_name || '';
            const lastName = evt.data.last_name || '';
            const avatar = evt.data.image_url || null;
            const defaultCollegeId = 45; // Default matching auth.controller.js

            // Update user metadata in Clerk with default 'student' role
            await clerkClient.users.updateUser(id, {
                publicMetadata: {
                    role: 'student'
                }
            });

            // Save to database
            await createUser(id, username, email, defaultCollegeId, null, avatar, {
                firstName,
                lastName
            });

            try {
                await createAuditLog(id, 'AUTH', 'REGISTER_WEBHOOK', 'User', id);
            } catch (err) {
                console.error("Error creating audit log:", err);
            }

            console.log(`Clerk Webhook: User ${id} saved to DB and 'student' role assigned in Clerk.`);
        }

        return res.status(200).json({ success: true, message: 'Webhook received' });

    } catch (error) {
        console.error('Error handling webhook:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
