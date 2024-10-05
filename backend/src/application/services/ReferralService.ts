import { ReferralRepository, UserRepository } from '@domain/repositories';
import { ReferralStats, User } from '@domain/models';
import { CustomError } from 'application/errors';
import { StatusCodes } from 'http-status-codes';
import { generateReferralCode } from '@utils/utilsCommon';

export interface IReferralService {
    retrieveReferralCode(userId: string): Promise<string>;
    generateReferralCode(userId: string): Promise<string>;
    applyReferralCode(userId: string, referralCode: string): Promise<boolean>;
    getReferralStats(userId: string): Promise<ReferralStats>;
}

export class ReferralService implements IReferralService {
    constructor(
        private readonly referralDBRepo: ReferralRepository,
        private readonly userDBRepo: UserRepository
    ) {}

    async retrieveReferralCode(userId: string): Promise<string> {
        const referralCode =
            await this.referralDBRepo.fetchReferralCode(userId);
	console.log(referralCode);
        if (!referralCode) {
            throw new CustomError(
                'Referral code not found',
                StatusCodes.NOT_FOUND
            );
        }
        return referralCode;
    }

    async generateReferralCode(userId: string): Promise<string> {
        return generateReferralCode(userId);
    }

    async applyReferralCode(
        refereeId: string,
        referralCode: string
    ): Promise<boolean> {
        const referee: User = await this.userDBRepo.getUserById(refereeId);
        if (referee.referredBy) {
            throw new CustomError(
                'User has already applied a referral code',
                StatusCodes.BAD_REQUEST
            );
        }
        const referrer =
            await this.userDBRepo.getUserByReferralCode(referralCode);
        if (!referrer) {
            throw new CustomError(
	        'Referral code does not exist',
	        StatusCodes.BAD_REQUEST
	    );
        }
        await this.referralDBRepo.updateRefereeByReferredBy(
            refereeId,
            referrer.id
        );
        await this.referralDBRepo.updateReferrerByReferredUsers(
            referrer.id,
            refereeId
        );

        return true;
    }

    async getReferralStats(userId: string): Promise<ReferralStats> {
        const referralStats =
            await this.referralDBRepo.fetchReferralStats(userId);
        return referralStats;
    }
}
