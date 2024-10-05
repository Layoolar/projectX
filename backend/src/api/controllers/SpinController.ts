import { jsonResponse } from '@utils/Response';
import { SpinService } from 'application/services/SpinService';
import { StatusCodes } from 'http-status-codes';
import { RequestHandler, Request, Response } from 'express';

export class SpinController {
    constructor(private readonly spinService: SpinService) {}

    spin: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.user.id;
        const spinReward = await this.spinService.spinWheel(userId);
        return jsonResponse(
            res,
            StatusCodes.OK,
            'Spin successful! You have received your reward.',
            { spinReward }
        );
    };
}
