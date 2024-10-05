import { Permission, User } from '@domain/models';
import { TwitterAuthRepoImpl } from '@infrastructure/twitter';
import { generateReferralCode, getCurrentTimeStamp } from '@utils/utilsCommon';
import { UserRepositoryImpl } from 'application/repoimpls';
import { IOAuth2RequestTokenResult } from 'twitter-api-v2';
import CONFIG from '@main/config';

export interface IAuthService {
    getTwitterOAuthLink(callback_url: string): IOAuth2RequestTokenResult;
    authCallback(
        code: string,
        codeVerifier: string,
        callback_url: string
    ): Promise<{
        user: User;
    }>;
}

export class AuthService implements IAuthService {
    constructor(
        private readonly userDBRepo: UserRepositoryImpl,
        private readonly twitterRepo: TwitterAuthRepoImpl
    ) {}
    getTwitterOAuthLink(callback_url: string) {
        return this.twitterRepo.generateOAuthLink(callback_url);
    }

    async authCallback(
        code: string,
        codeVerifier: string,
        callback_url: string
    ): Promise<{
        isNewUser: boolean;
        user: User;
    }> {
        const { user, accessToken, refreshToken, expiresIn } =
            await this.twitterRepo.loginWithOAuth2(
                code,
                codeVerifier,
                callback_url
            );
        let permission = Permission.USER;
        if (user.data.username === CONFIG.SUPER_ADMIN) {
            permission = Permission.SUPER_ADMIN;
        }
        const newUser: User = {
            id: user.data.id,
            permission,
            rewardTokens: {
                claimed: 0,
                unclaimed: 0,
                referralPoints: 0,
            },
            twitter: {
                id: user.data.id,
                username: user.data.username,
                profile_image_url: user.data.profile_image_url,
            },
            twitterOAuth: {
                accessToken,
                refreshToken,
                expiresIn,
            },
            createdAt: getCurrentTimeStamp(),
            updatedAt: getCurrentTimeStamp(),
            referredBy: null,
            referredUsers: [],
            referralCode: generateReferralCode(user.data.id),
            totalTokens: 0,
        };
        newUser.twitter.profile_image_url =
            newUser.twitter.profile_image_url?.replace('_normal', '');
        const userExists = await this.userDBRepo.getUserById(user.data.id);
        let isNewUser = false;
        if (userExists) {
            await this.userDBRepo.updateUserTwitterDetails(
                user.data.id,
                newUser.twitter,
                { accessToken, refreshToken, expiresIn }
            );
        } else {
            isNewUser = true;
            await this.userDBRepo.createUser(newUser);
        }
        return {
            isNewUser,
            user: userExists || newUser,
        };
    }
}
