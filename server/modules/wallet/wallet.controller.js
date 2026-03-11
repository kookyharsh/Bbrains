import { z } from 'zod';
import { transferFunds, getTransactionHistory, getWalletDetails } from "./wallet.service.js";
import { sendSuccess, sendCreated, sendError } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import prisma from "../../utils/prisma.js";
import bcrypt from "bcrypt";

const setupPinSchema = z.object({
    pin: z.string().length(6).regex(/^\d+$/, 'PIN must be 6 digits')
});

const changePinSchema = z.object({
    oldPin: z.string().length(6),
    newPin: z.string().length(6).regex(/^\d+$/, 'PIN must be 6 digits')
});

const transferSchema = z.object({
    recipientWalletId: z.string().email("Invalid email format"),
    amount: z.number().positive(),
    note: z.string().max(255).optional(),
    pin: z.string().length(6)
});

// GET /wallet/me
export const getWalletHandler = async (req, res) => {
    try {
        const result = await getWalletDetails(req.user.id);
        if (!result) return sendError(res, 'Wallet not found', 404);
        // Don't expose PIN
        const { pin, ...wallet } = result;
        return sendSuccess(res, wallet);
    } catch (error) {
        return sendError(res, 'Failed to fetch wallet', 500);
    }
};

// GET /wallet/balance
export const getBalance = async (req, res) => {
    try {
        const wallet = await prisma.wallet.findUnique({
            where: { userId: req.user.id },
            select: { balance: true }
        });
        if (!wallet) return sendError(res, 'Wallet not found', 404);
        return sendSuccess(res, wallet);
    } catch (error) {
        return sendError(res, 'Failed to fetch balance', 500);
    }
};

// POST /wallet/setup
export const setupPin = async (req, res) => {
    try {
        const validated = setupPinSchema.parse(req.body);

        const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
        if (!wallet) {
            // Create wallet with email as ID and PIN
            const hashedPin = await bcrypt.hash(validated.pin, 10);
            const userEmail = req.user.email;
            const newWallet = await prisma.wallet.create({
                data: { id: userEmail, userId: req.user.id, pin: hashedPin, balance: 500 }
            });
            await createAuditLog(req.user.id, 'FINANCE', 'SETUP_PIN', 'Wallet', newWallet.id);
            return sendCreated(res, { id: newWallet.id }, 'Wallet created and PIN set');
        }

        // Update PIN if it's the default
        if (wallet.pin === '000000') {
            const hashedPin = await bcrypt.hash(validated.pin, 10);
            await prisma.wallet.update({
                where: { userId: req.user.id },
                data: { pin: hashedPin }
            });
            await createAuditLog(req.user.id, 'FINANCE', 'SETUP_PIN', 'Wallet', wallet.id);
            return sendSuccess(res, null, 'PIN set successfully');
        }

        return sendError(res, 'PIN already set. Use change PIN endpoint.', 400);
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to setup PIN', 500);
    }
};

// PUT /wallet/pin
export const changePin = async (req, res) => {
    try {
        const validated = changePinSchema.parse(req.body);

        const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
        if (!wallet) return sendError(res, 'Wallet not found', 404);

        // For legacy plain-text PINs, do direct comparison; for hashed, use bcrypt
        let pinMatch = false;
        if (wallet.pin.length > 6) {
            pinMatch = await bcrypt.compare(validated.oldPin, wallet.pin);
        } else {
            pinMatch = wallet.pin === validated.oldPin;
        }

        if (!pinMatch) return sendError(res, 'Invalid old PIN', 401);

        const hashedPin = await bcrypt.hash(validated.newPin, 10);
        await prisma.wallet.update({
            where: { userId: req.user.id },
            data: { pin: hashedPin }
        });

        await createAuditLog(req.user.id, 'FINANCE', 'CHANGE_PIN', 'Wallet', wallet.id);
        return sendSuccess(res, null, 'PIN changed successfully');
    } catch (error) {
        console.error(error)
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to change PIN', 500);
    }
};

// POST /wallet/verify-pin
export const verifyPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin) return sendError(res, 'PIN required', 400);

        const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
        if (!wallet) return sendError(res, 'Wallet not found', 404);

        let pinMatch = false;
        if (wallet.pin.length > 6) {
            pinMatch = await bcrypt.compare(pin, wallet.pin);
        } else {
            pinMatch = wallet.pin === pin;
        }

        if (!pinMatch) return sendError(res, 'Invalid PIN', 401);
        return sendSuccess(res, { verified: true }, 'PIN verified');
    } catch (error) {
        return sendError(res, 'Failed to verify PIN', 500);
    }
};

// POST /wallet/transfer
export const transferHandler = async (req, res) => {
    try {
        const validated = transferSchema.parse(req.body);
        const result = await transferFunds(req.user.id, validated.recipientWalletId, validated.amount, validated.note, validated.pin);

        await createAuditLog(req.user.id, 'FINANCE', 'TRANSFER', 'Wallet', req.user.id, {
            amount: validated.amount,
            recipientWalletId: validated.recipientWalletId
        });

        return sendSuccess(res, result, 'Transfer successful');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, error.message, 400);
    }
};

// GET /wallet/history (kept for backward compat)
export const getHistoryHandler = async (req, res) => {
    try {
        const result = await getTransactionHistory(req.user.id);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, 'Failed to fetch history', 500);
    }
};
