import { jsonResponse } from '@utils/Response';
import { CustomError } from 'application/errors';
import { UserService } from 'application/services';
import { RequestHandler, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class UserController {
    constructor(private readonly userService: UserService) {}

    getProfile: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.user.id;
        if (!userId) {
            throw new CustomError('login required', StatusCodes.UNAUTHORIZED);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { twitterOAuth, ...rest } =
            await this.userService.getProfile(userId);
        const user = {
            ...rest,
            referredUsers: rest.referredUsers?.length ?? 0,
            totalTokens: rest.totalTokens ?? 0,
        };
	console.log(user);
        return jsonResponse(
            res,
            StatusCodes.OK,
            'User profile retrieved successfully',
            user
        );
    };

    getLeaderboard: RequestHandler = async (
        _: Request,
        res: Response
    ): Promise<void> => {
        const leaderboard = await this.userService.getLeaderboard();
        jsonResponse(
            res,
            StatusCodes.OK,
            'Leaderboard retrieved successfully',
            leaderboard.map((ld, idx) => ({
                ...ld,
                referredUsers: ld.referredUsers?.length ?? 0,
                totalTokens: ld.totalTokens ?? 0,
                rank: idx + 1,
            }))
        );
    };

    getUserRank: RequestHandler = async (
        req: Request,
	res: Response
    ): Promise<void> => {
        const userId = req.user?.id;
        const rank = await this.userService.getRank(userId);
        jsonResponse(
            res,
            StatusCodes.OK,
            'Rank retrieved succesfully',
            { rank }
        );
    }

    updateUserPoints: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const tokens = req.body.rewardTokens;
        if (!userId) {
            throw new CustomError('login required', StatusCodes.UNAUTHORIZED);
        }
        await this.userService.updateUserPoints(userId, tokens);
        return jsonResponse(
            res,
            StatusCodes.OK,
            'User points updated successfully'
        );
    };

    promoteUser: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.body.userId;
        if (!userId) {
            throw new CustomError('userId not passed', StatusCodes.BAD_REQUEST);
        }
        await this.userService.promoteUser(userId);
        return jsonResponse(
            res,
            StatusCodes.OK,
            'user has been promoted to admin'
        );
    };

    demoteUser: RequestHandler = async (req: Request, res: Response) => {
        const userId = req.body.userId;
        if (!userId) {
            throw new CustomError('userId not passed', StatusCodes.BAD_REQUEST);
        }
        await this.userService.demoteUser(userId);
        return jsonResponse(
            res,
            StatusCodes.OK,
            'user has been removed as admin'
        );
    };
}
