import { Permission } from '@domain/models';
import CONFIG from '@main/config';
import { CustomError } from 'application/errors';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function superAdminMiddleware(
    req: Request,
    _: Response,
    next: NextFunction
) {
    console.log(req.user, Permission.SUPER_ADMIN, CONFIG.SUPER_ADMIN);
    if (
        req.user &&
        (req.user.permission === Permission.SUPER_ADMIN ||
            req.user.username === CONFIG.SUPER_ADMIN)
    ) {
        return next();
    }
    throw new CustomError('Unauthorized', StatusCodes.UNAUTHORIZED);
}

export function adminMiddleware(req: Request, _: Response, next: NextFunction) {
    console.log(req.user, Permission.SUPER_ADMIN);
    if (
        req.user &&
        (req.user.permission === Permission.SUPER_ADMIN ||
            req.user.permission === Permission.ADMIN)
    ) {
        return next();
    }
    throw new CustomError('Unauthorized', StatusCodes.UNAUTHORIZED);
}
