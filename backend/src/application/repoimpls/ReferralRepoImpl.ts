import { User, ReferralStats } from '@domain/models';
import { ReferralRepository } from '@domain/repositories';
import { MongoDatabase } from '@infrastructure/database/MongoDB';
import { generateReferralCode } from '@utils/utilsCommon';
import { CustomError } from 'application/errors';
import { StatusCodes } from 'http-status-codes';

export class ReferralRepositoryImpl implements ReferralRepository {
    private readonly userCollection;

    constructor(private readonly db: MongoDatabase) {
        this.userCollection = this.db.getDb().collection<User>('User');
    }

    async fetchReferralCode(userId: string): Promise<string | null> {
        const user = await this.userCollection.findOne({ id: userId });
        return user ? user.referralCode : null;
    }

    async saveReferralCode(
        userId: string,
        referralCode: string
    ): Promise<void> {
        let isUnique = false;
        while (!isUnique) {
            if (!(await this.userCollection.findOne({ referralCode }))) {
                isUnique = true;
            } else {
                referralCode = generateReferralCode(userId);
            }
        }

        await this.userCollection.updateOne(
            { id: userId },
            { $set: { referralCode } }
        );
    }

    async updateRefereeByReferredBy(
        refereeId: string,
        referrerId: string
    ): Promise<void> {
        await this.userCollection.updateOne(
            { id: refereeId },
            { $set: { referredBy: referrerId } }
        );
    }

    async updateReferrerByReferredUsers(
        referrerId: string,
        refereeId: string
    ): Promise<void> {
        await this.userCollection.updateOne(
            { id: referrerId },
            { $addToSet: { referredUsers: refereeId } }
        );
    }

    async fetchReferralStats(userId: string): Promise<ReferralStats> {
        const user = await this.userCollection.findOne({ id: userId });
        if (!user) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND);
        }
        const referralUsers = await this.userCollection
            .find({ referredBy: userId })
            .toArray();

        const totalReferrals = referralUsers.length;

        return {
            totalReferrals,
            totalReferralPoints: user.rewardTokens.referralPoints,
        };
    }
}
