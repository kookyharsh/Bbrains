/**
 * Custom Error Classes for consistent error handling
 */

export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Not authenticated') {
        super(message, 401);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = null) {
        super(message, 400);
        this.errors = errors;
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
