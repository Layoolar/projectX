import { AuthService, ReferralService } from 'application/services';
import { jsonResponse } from '@utils/Response';
import { Request, Response, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import CONFIG from '@main/config';
import { CustomError } from 'application/errors';

export class AuthController {
    private readonly callback_url = CONFIG.CALLBACK_URL;
    private jwtSecret = CONFIG.JWT_SECRET;

    constructor(
        private readonly authService: AuthService,
	private readonly referralService: ReferralService
    ) {}

    getOauthUrl: RequestHandler = (_: Request, res: Response) => {
        const { url, codeVerifier, state } =
            this.authService.getTwitterOAuthLink(this.callback_url);
        const token = jwt.sign({ state, codeVerifier }, this.jwtSecret, {
            expiresIn: '10m',
        });

        console.log('JWT token generated during url gen');
        return jsonResponse(
            res,
            StatusCodes.OK,
            'Twitter OAuth login generated',
            {
                url,
                token,
            }
        );
    };

    handleOAuthCallback: RequestHandler = async (
        req: Request,
        res: Response
    ) => {
        const { state, code } = req.query;

        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new CustomError(
                'Authorization token is missing',
                StatusCodes.BAD_REQUEST
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(token, this.jwtSecret) as {
                state: string;
                codeVerifier: string;
            };
        } catch (error) {
            throw new CustomError(
                'Unable to verify token',
                StatusCodes.BAD_REQUEST
            );
        }

        const { state: tokenState, codeVerifier } = decoded;
        console.log('Decoded JWT', decoded);

        if (!codeVerifier || !state || !tokenState || !code) {
            throw new CustomError(
                'Invalid authentication request parameters',
                StatusCodes.BAD_REQUEST
            );
        }

        if (state !== tokenState) {
            throw new CustomError('State mismatch', StatusCodes.BAD_REQUEST);
        }

        const { user: u, isNewUser } = await this.authService.authCallback(
            code as string,
            codeVerifier,
            this.callback_url
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { twitterOAuth, ...user } = u;
        const jwtToken = jwt.sign(
            {
                id: user.id,
                username: user.twitter.username,
                permission: user.permission,
            },
            this.jwtSecret,
            {
                expiresIn: '7d',
            }
        );

	return jsonResponse(res, StatusCodes.OK, 'Authentication successful', {
            user,
            isNewUser,
            token: jwtToken,
        });
    };
}
