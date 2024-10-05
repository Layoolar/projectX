import { Response } from 'express';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export const jsonResponse = (
    res: Response,
    statusCode: StatusCodes,
    message: string,
    data: object = {}
) => {
    return res.status(statusCode).json({
        statusCode,
        statusMessage: getReasonPhrase(statusCode),
        message,
        data,
    });
};
