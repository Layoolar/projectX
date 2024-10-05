import {
    Permission,
    TwitterData,
    TwitterOAuthToken,
    User,
} from '@domain/models';
import { UserRepository } from '@domain/repositories';
import { MongoDatabase } from '@infrastructure/database/MongoDB';
import { getCurrentTimeStamp } from '@utils/utilsCommon';
import { CustomError } from 'application/errors';
import { StatusCodes } from 'http-status-codes';

export class UserRepositoryImpl implements UserRepository {
    private readonly userCollection;

    constructor(private readonly db: MongoDatabase) {
        this.userCollection = this.db.getDb().collection<User>('User');
    }

    async createUser(user: User): Promise<void> {
        const result = await this.userCollection.insertOne(user);
        if (!result.acknowledged) {
            throw new CustomError(
                'Failed to create user',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getUserById(userId: string): Promise<User> {
        //null shouldn't be returned, it can't be handled by receiving layers
        const user = await this.userCollection.findOne({ id: userId });
        return user as User;
    }

    async getUserByReferralCode(referralCode: string): Promise<User> {
        console.log(referralCode);
	const user = await this.userCollection.findOne({ referralCode: `${referralCode}` });
        return user as User;
    }

    async getUsersOrderedByPoints(): Promise<User[] | []> {
        const users = await this.userCollection
            .find({})
            .project({
                twitterOAuth: 0,
                _id: 0,
            })
            .sort({ totalTokens: -1 })
            .toArray();
        return users as User[] | [];
    }

    async updateUserPoints(
        userId: string,
        tokens: number,
        isReferral?: boolean
    ): Promise<void> {
        let update: {
            'rewardTokens.unclaimed': number;
            totalTokens: number;
            'rewardTokens.referralPoints'?: number;
        } = {
            'rewardTokens.unclaimed': tokens,
            totalTokens: tokens,
        };
        if (isReferral) {
            update = { ...update, 'rewardTokens.referralPoints': tokens };
        }
        const result = await this.userCollection.updateOne(
            { id: userId },
            {
                $inc: update,
            }
        );
        if (result.matchedCount === 0) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND); // documents matched
        }
    }

    async updateUserSpinAt(userId: string, spinAt: number) {
        await this.userCollection.updateOne(
            { id: userId },
            {
                $set: { lastSpinAt: spinAt },
            }
        );
    }

    async updateUserTwitterDetails(
        userId: string,
        twitter: TwitterData,
        twitterOAuth: TwitterOAuthToken
    ): Promise<void> {
        const update = { twitter, twitterOAuth };
        const result = await this.userCollection.updateOne(
            { id: userId },
            { $set: update }
        );
        if (result.matchedCount === 0) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND);
        }
    }

    async updateUserTwitterAuth(
        userId: string,
        twitterAuth: TwitterOAuthToken
    ): Promise<void> {
        const update = { twitterOAuth: twitterAuth };
        const result = await this.userCollection.updateOne(
            { id: userId },
            { $set: update }
        );
        if (result.matchedCount === 0) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND);
        }
    }

    async promoteUser(userId: string): Promise<void> {
        const result = await this.userCollection.updateOne(
            { id: userId },
            { $set: { permission: Permission.ADMIN } }
        );
        if (result.matchedCount === 0) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND);
        }
    }

    async demoteUser(userId: string): Promise<void> {
        const result = await this.userCollection.updateOne(
            { id: userId },
            { $set: { permission: Permission.USER } }
        );
        if (result.matchedCount === 0) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND);
        }
    }

    async updateReferrerReward(userId: string, taskReward: number) {
        const user = await this.userCollection.findOne({ id: userId });
        if (!user) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND);
        }
        if (user.referredBy) {
            const referrerId = user.referredBy;
            const referrerReward = taskReward * 0.08;

            await this.updateUserPoints(referrerId, referrerReward, true);
        }
    }
}
