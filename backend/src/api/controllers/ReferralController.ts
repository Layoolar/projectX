import { jsonResponse } from '@utils/Response';
import { RequestHandler, Request, Response } from 'express';
import { ReferralService } from 'application/services';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from 'application/errors';

export class ReferralController {
    constructor(private readonly referralService: ReferralService) {}

    createReferralCode: RequestHandler = async (
        req: Request,
        res: Response
    ) => {
        const userId = req.user.id;
        const referralCode =
            await this.referralService.generateReferralCode(userId);
        return jsonResponse(
            res,
            StatusCodes.CREATED,
            'Referral code created successfully',
            { referralCode }
        );
    };

    validateReferralCode: RequestHandler = async (
        req: Request,
        res: Response
    ) => {
        const refereeId = req.user.id;
        const referralCode = req.body.referralCode.referralCode;
        if (!referralCode) {
            throw new CustomError(
                'Referral code missing in request',
                StatusCodes.BAD_REQUEST
            );
        }
        const isValid = await this.referralService.applyReferralCode(
            refereeId,
            referralCode
        );
        return jsonResponse(res, StatusCodes.OK, '', { isValid });
    };

    getReferralStats: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.user.id;
        const stats = await this.referralService.getReferralStats(userId);
        return jsonResponse(res, StatusCodes.OK, '', stats);
    };
}
