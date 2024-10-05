import { NextFunction, Request, Response } from 'express';
import { CustomError } from 'application/errors';
import { StatusCodes } from 'http-status-codes';
import { TaskSchema, UpdateTaskSchema } from 'api/validation/';

const validateTask =
    (schema: typeof TaskSchema) =>
    async (req: Request, _: Response, next: NextFunction) => {
        const data = req.body;
        if (!data) {
            return next(
                new CustomError('Invalid request data', StatusCodes.BAD_REQUEST)
            );
        }

        const { error } = schema.validate(data);
        if (error) {
            return next(
                new CustomError(error.message, StatusCodes.BAD_REQUEST)
            );
        }

        next();
    };

const validateUpdateTask =
    (schema: typeof UpdateTaskSchema) =>
    async (req: Request, _: Response, next: NextFunction) => {
        const data = req.body;
        if (!data) {
            return next(
                new CustomError('Invalid request data', StatusCodes.BAD_REQUEST)
            );
        }

        const { error } = schema.validate(data);
        if (error) {
            return next(
                new CustomError(error.message, StatusCodes.BAD_REQUEST)
            );
        }

        next();
    };

export { validateTask, validateUpdateTask };
