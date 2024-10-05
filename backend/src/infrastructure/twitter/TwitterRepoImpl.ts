import TwitterApi, {
    IOAuth2RequestTokenResult,
    UserV2Result,
} from 'twitter-api-v2';
import CONFIG from '@main/config';
export interface TwitterAuthRepository {
    generateOAuthLink(callback_url: string): IOAuth2RequestTokenResult;
    loginWithOAuth2(
        code: string,
        codeVerifier: string,
        callback_url: string
    ): Promise<{
        user: UserV2Result;
        accessToken: string;
        refreshToken: string | undefined;
        expiresIn: number;
    }>;
    //followUser(userId: string): Promise<void>
}

export class TwitterAuthRepoImpl implements TwitterAuthRepository {
    private twitterClient: TwitterApi;

    constructor() {
        this.twitterClient = new TwitterApi({
            clientId: CONFIG.TWITTER.CLIENT_ID,
            clientSecret: CONFIG.TWITTER.CLIENT_SECRET,
        });
    }

    generateOAuthLink(callback_url: string): IOAuth2RequestTokenResult {
        return this.twitterClient.generateOAuth2AuthLink(callback_url, {
            scope: [
                'tweet.read',
                'users.read',
                'follows.read',
                'like.read',
                'offline.access',
            ],
        });
    }

    async loginWithOAuth2(
        code: string,
        codeVerifier: string,
        callback_url: string
    ): Promise<{
        user: UserV2Result;
        accessToken: string;
        refreshToken: string | undefined;
        expiresIn: number;
    }> {
        const { client, accessToken, refreshToken, expiresIn } =
            await this.twitterClient.loginWithOAuth2({
                code,
                codeVerifier,
                redirectUri: callback_url,
            });
        const connectedUser = await client.v2.me({
            'user.fields': ['profile_image_url'],
        });
        return { user: connectedUser, accessToken, refreshToken, expiresIn };
    }
}
