import { CustomError } from 'application/errors';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import CONFIG from '@main/config';
import { RequestUserData } from 'index';

export const userAuthMiddleware = (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        throw new CustomError(
            'Authorization token is missing',
            StatusCodes.BAD_REQUEST
        );
    }

    let decoded;

    try {
        decoded = jwt.verify(token, CONFIG.JWT_SECRET) as RequestUserData;
    } catch (error) {
        throw new CustomError(
            'Unable to verify token, login required',
            StatusCodes.UNAUTHORIZED
        );
    }
    if (!decoded.id || !decoded.username || !decoded.permission) {
        throw new CustomError(
            'Unable to verify token, login required',
            StatusCodes.UNAUTHORIZED
        );
    }
    req.user = decoded;
    console.log(req.user);
    next();
};
