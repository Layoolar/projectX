import { VerificationResult } from '@infrastructure/twitter/utils';
import CONFIG from '@main/config';
import { CustomError } from 'application/errors';
import { StatusCodes } from 'http-status-codes';
import TwitterApi, { ApiResponseError } from 'twitter-api-v2';

/**
 * extractId()
 * ===========================
 *
 * @param {string} link - link string
 * @return {boolean} true / false
 */
export const extractId = (link: string): string | null => {
    const regexPattern = /(twitter|x)\.com\/([^/]+)\/status\/(\d+)/;
    const match = link.match(regexPattern);
    if (match && match.length === 4) {
        return match[3]; // Extracted tweet ID
    } else {
        return null;
    }
};

/**
 * checkLinkandExtractUsername()
 * =================================
 *
 * @param {string} link - link string
 * @return {string | null} - match or null
 */
export const extractUsername = (link: string): string | null => {
    const regexPattern = /^https:\/\/(twitter|x)\.com\/(\w+)/;
    const match = link.match(regexPattern);
    if (match && match.length === 3) {
        //console.log(match);
        //console.log('Twitter username  ', match[2]);
        return match[2]; // Extracted username
    } else {
        return null;
    }
};

export function clientInst() {
    return new TwitterApi({
        clientId: CONFIG.TWITTER.CLIENT_ID,
        clientSecret: CONFIG.TWITTER.CLIENT_SECRET,
    });
}

export async function makeTwitterRequestWithTokenRefresh<T>(
    userAccessToken: string,
    userRefreshToken: string,
    makeRequest: (client: TwitterApi, data: T) => Promise<boolean>,
    data: T,
    newclient?: TwitterApi
): Promise<VerificationResult> {
    try {
        // Attempt to make the initial request
        const response = await makeRequest(
            newclient ?? new TwitterApi(userAccessToken),
            data
        );
        return { response, newAuth: null, retryError: null };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log('Error in makeTwitterRequestWithTokenRefresh: ', error);

        // Check if the error is due to an expired token
        if (error instanceof ApiResponseError && error.rateLimitError) {
            //await addTaskToStore('');
            console.log(error.rateLimit);
            throw error;
        } else if (
            (error instanceof ApiResponseError && error.isAuthError) ||
            error.code === 401 ||
            error?.data?.code === 401
        ) {
            if (!userRefreshToken) {
                throw new CustomError(
                    'Login required',
                    StatusCodes.UNAUTHORIZED
                );
            }

            try {
                // Refresh the access token using the refresh token
                console.log('Access token expired, trying to refresh token');
                console.log('Old refresh token: ', userRefreshToken);
                const refreshClient = clientInst();
                const newAuth =
                    await refreshClient.refreshOAuth2Token(userRefreshToken);

                console.log('New Auth:', newAuth);

                try {
                    // Retry the request with the new access token
                    const response = await makeRequest(newAuth.client, data);
                    return { response, newAuth, retryError: null };
                } catch (retryError) {
                    // If retry fails, return the refreshed token but with the retry error
                    console.log('Retry request failed:', retryError);
                    return { response: null, newAuth, retryError };
                }
            } catch (refreshError) {
                // If token refresh fails, throw an error
                console.log('Token refresh failed:', refreshError);
                throw refreshError;
            }
        } else {
            // Throw the original error if it wasn't due to an expired token
            throw error;
        }
    }
}

export async function verifyTweetLike(
    client: TwitterApi,
    { taskTweetId, userId }: { taskTweetId: string; userId: string }
): Promise<boolean> {
    let liked = false;
    let nextToken;
    do {
        const res = await client.v2.userLikedTweets(userId, {
            pagination_token: nextToken,
        });
        liked = res?.data?.data?.some((tweet) => tweet.id === taskTweetId);
        if (liked) break;
        nextToken = res.meta.next_token;
    } while (nextToken);
    return liked;
}

export async function verifyUserFollow(
    client: TwitterApi,
    { atfu, userId }: { atfu: string; userId: string }
): Promise<boolean> {
    let follows = false;
    let nextToken: string | undefined = undefined;
    do {
        const res = await client.v2.following(userId);
        follows = res?.data?.some((user) => user.username === atfu);
        if (follows) break;
        nextToken = res.meta.next_token;
    } while (nextToken);
    return follows;
}

export async function verifyRetweet(
    client: TwitterApi,
    { taskTweetId, userId }: { taskTweetId: string; userId: string }
): Promise<boolean> {
    let userRetweeted = false;
    let nextToken;
    do {
        const accounts = await client.v2.tweetRetweetedBy(taskTweetId, {
            asPaginator: true,
        });
        userRetweeted = accounts?.data?.data?.some(
            (user) => user.id === userId
        );
        if (userRetweeted) break;
        nextToken = accounts.meta.next_token;
    } while (nextToken);
    return userRetweeted;
}

export async function verifyComment(
    client: TwitterApi,
    { taskTweetId, userId }: { taskTweetId: string; userId: string }
): Promise<boolean> {
    const tweet = await client.v2.singleTweet(taskTweetId, {
        'tweet.fields': ['conversation_id'],
    });

    const data = tweet?.data;
    let userCommented = false;
    let next_token;

    if (data && data.conversation_id) {
        do {
            console.log(`Conversation ID: ${data.conversation_id}`);
            const searchResponse = await client.v2.search({
                query: `conversation_id:${data.conversation_id} in_reply_to_status_id:${taskTweetId} from:${userId}`,
                'tweet.fields': ['in_reply_to_user_id', 'author_id'],
            });
            userCommented = searchResponse?.data?.data?.some(
                (reply) => reply.author_id === userId
            );
            if (userCommented) return true;
            next_token = searchResponse?.data?.meta?.next_token;
        } while (next_token);
    }
    return userCommented;
}
