import { AuthController } from '@api/controllers/AuthController';
import { TwitterAuthRepoImpl } from '@infrastructure/twitter/TwitterRepoImpl';
import { referralDBRepo, userDBRepo } from 'application/repoimpls';
import { AuthService, ReferralService } from 'application/services';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

const authRouter = Router();

const twitterRepo = new TwitterAuthRepoImpl();

const authService = new AuthService(userDBRepo, twitterRepo);
const referralService = new ReferralService(referralDBRepo, userDBRepo);
const authController = new AuthController(authService, referralService);

authRouter.get(
    '/twitter',
    expressAsyncHandler(authController.getOauthUrl.bind(authController))
);

authRouter.get(
    '/twitter/callback',
    expressAsyncHandler(authController.handleOAuthCallback.bind(authController))
);

export default authRouter;
