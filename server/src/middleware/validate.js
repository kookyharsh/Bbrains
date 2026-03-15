import { ZodError } from 'zod';

/**
 * Zod validation middleware factory.
 * @param {Object} schemas - { body?, params?, query? } Zod schemas
 * Usage: validate({ body: createCollegeSchema })
 */
const validate = (schemas) => {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: formattedErrors
                });
            }
            next(error);
        }
    };
};

export default validate;
