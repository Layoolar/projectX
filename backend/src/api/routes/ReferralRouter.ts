import { ReferralController } from '@api/controllers';
import { referralDBRepo, userDBRepo } from 'application/repoimpls';
import { ReferralService } from 'application/services';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const referralRouter = Router();

const referralService = new ReferralService(referralDBRepo, userDBRepo);
const referralController = new ReferralController(referralService);

// referral code is already being returned in the User object, no need for a separate endpoint

referralRouter.post(
    '/use',
    expressAsyncHandler(
        referralController.validateReferralCode.bind(referralController)
    )
);

referralRouter.get(
    '/stats',
    expressAsyncHandler(
        referralController.getReferralStats.bind(referralController)
    )
);

export default referralRouter;
