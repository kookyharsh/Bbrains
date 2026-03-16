import { AppError } from '../utils/errors.js';
import { ZodError } from 'zod';

/**
 * Global error handler middleware.
 * Must be registered LAST with app.use(errorHandler).
 */
const errorHandler = (err, req, res, next) => {
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', err);
    }

    // Handle Zod validation errors (with support for different Zod instances/versions)
    if (err instanceof ZodError || err.name === 'ZodError' || err.constructor.name === 'ZodError') {
        const errors = err.errors ? err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        })) : [];
        
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }


    // Handle our custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors && { errors: err.errors })
        });
    }

    // Handle Prisma known errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'A record with this value already exists'
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Record not found'
        });
    }

    if (err.code === 'P2000') {
        return res.status(400).json({
            success: false,
            message: 'Input value is too long for one or more fields'
        });
    }

    // Default 500
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error'
    });
};

export default errorHandler;
