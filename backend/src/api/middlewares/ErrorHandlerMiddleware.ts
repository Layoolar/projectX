import { NextFunction, Request, Response } from 'express';
import { CustomError } from 'application/errors';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { ApiResponseError } from 'twitter-api-v2';

export const catchAllErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: NextFunction
) => {
    //const resBody = {
    //    body: req.body,
    //    query: req.query,
    //    params: req.params,
    //    ip: req.ip,
    //    url: req.originalUrl,
    //    method: req.method,
    //    path: req.path,
    //    headers: {
    //        'Content-Type': req.get('Content-Type'),
    //        Referer: req.get('referer'),
    //        'User-Agent': req.get('User-Agent'),
    //    },
    //};
    console.log('In error handler :-> ', err);
    if (err instanceof ApiResponseError) {
        let msg = 'try loggin in again';
        if (err.rateLimitError) {
            msg = 'please try again in 15 mins';
        }
        if (err.isAuthError) {
            msg = 'authentication error, please log out and login again';
        }
        const reasonPhrase = getReasonPhrase(err.code);
        console.log('Is rate limit error', err.rateLimitError);
        console.log('Is authentication error', err.isAuthError);
        return res.status(err.code).json({
            statusCode: err.code,
            statusMessage: reasonPhrase,
            error: {
                message: `${err.message}, ${msg}`,
            },
        });
    } else if (err instanceof CustomError) {
        const { message, statusCode, data } = err;
        const responsePhrase = getReasonPhrase(statusCode);
        return res.status(statusCode).json({
            statusCode,
            statusMessage: responsePhrase,
            //request: resBody,
            error: { message, data },
        });
    }

    const responseCode = StatusCodes.INTERNAL_SERVER_ERROR;
    const responsePhrase = getReasonPhrase(responseCode);
    return res.status(responseCode).json({
        status: responseCode,
        statusMessage: responsePhrase,
        //request: resBody,
        error: { message: responsePhrase },
    });
};

export const notFoundErrorHandler = (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    const error = new CustomError(
        `Path '${req.originalUrl}' not found`,
        StatusCodes.NOT_FOUND
    );
    next(error);
};
