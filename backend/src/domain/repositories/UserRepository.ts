import { User, TwitterData, TwitterOAuthToken } from '@domain/models';

export interface UserRepository {
    createUser(user: User): Promise<void>;
    getUserById(userId: string): Promise<User>;
    getUserByReferralCode(referralCode: string): Promise<User>;
    getUsersOrderedByPoints(): Promise<User[] | []>;
    updateUserPoints(
        userId: string,
        tokens: number,
        isReferral?: boolean
    ): Promise<void>;
    updateUserTwitterDetails(
        userId: string,
        twitter: TwitterData,
        twitterOauth: TwitterOAuthToken
    ): Promise<void>;
    updateUserTwitterAuth(
        userId: string,
        twitterAuth: TwitterOAuthToken
    ): Promise<void>;
    promoteUser(userId: string): Promise<void>;
    demoteUser(userId: string): Promise<void>;
    //deleteUser(userId: string): Promise<void>;
}
