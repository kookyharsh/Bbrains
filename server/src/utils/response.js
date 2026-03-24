/**
 * Standardized API Response Helpers
 */

export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const sendCreated = (res, data, message = 'Created successfully') => {
    return sendSuccess(res, data, message, 201);
};

export const sendPaginated = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit)
        }
    });
};

export const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
};
