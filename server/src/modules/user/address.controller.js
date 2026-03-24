import { z } from 'zod';
import {
    createAddressRecord,
    getAddressesByUserId,
    getAddressById,
    updateAddressRecord,
    deleteAddressRecord
} from './address.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

// Zod Schemas
const createAddressSchema = z.object({
    addressLine1: z.string().min(1).max(255),
    addressLine2: z.string().max(255).optional(),
    city: z.string().min(1).max(50),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(10).optional(),
    country: z.string().min(1).max(100)
});

const updateAddressSchema = createAddressSchema.partial();

// POST /addresses
export const createAddress = async (req, res) => {
    try {
        const validated = createAddressSchema.parse(req.body);
        const address = await createAddressRecord({ ...validated, userId: req.user.id });

        await createAuditLog(req.user.id, 'USER', 'CREATE', 'Address', address.id);
        return sendCreated(res, address, 'Address created successfully');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        }
        console.error(error);
        return sendError(res, 'Failed to create address', 500);
    }
};

// GET /addresses/me
export const getMyAddresses = async (req, res) => {
    try {
        const addresses = await getAddressesByUserId(req.user.id);
        return sendSuccess(res, addresses);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch addresses', 500);
    }
};

// PUT /addresses/:id
export const updateAddress = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid address ID', 400);

        // Check ownership
        const address = await getAddressById(id);
        if (!address) return sendError(res, 'Address not found', 404);
        if (address.userId !== req.user.id && req.user.type !== 'admin') {
            return sendError(res, 'Not authorized to update this address', 403);
        }

        const validated = updateAddressSchema.parse(req.body);
        const updated = await updateAddressRecord(id, validated);

        await createAuditLog(req.user.id, 'USER', 'UPDATE', 'Address', id, { after: validated });
        return sendSuccess(res, updated, 'Address updated successfully');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        }
        if (error.code === 'P2025') return sendError(res, 'Address not found', 404);
        console.error(error);
        return sendError(res, 'Failed to update address', 500);
    }
};

// DELETE /addresses/:id
export const deleteAddress = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid address ID', 400);

        const address = await getAddressById(id);
        if (!address) return sendError(res, 'Address not found', 404);
        if (address.userId !== req.user.id && req.user.type !== 'admin') {
            return sendError(res, 'Not authorized to delete this address', 403);
        }

        await deleteAddressRecord(id);
        await createAuditLog(req.user.id, 'USER', 'DELETE', 'Address', id);
        return sendSuccess(res, null, 'Address deleted successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Address not found', 404);
        console.error(error);
        return sendError(res, 'Failed to delete address', 500);
    }
};
