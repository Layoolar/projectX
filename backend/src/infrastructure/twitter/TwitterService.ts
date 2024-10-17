import CONFIG from "@main/config";
import { TwitterApi, TweetV2, TweetSearchRecentV2Paginator, Tweetv2SearchParams } from "twitter-api-v2";


export interface ITwitterService {
    getTweetLikes(tweetId: string): Promise<string[]>,
    getTweetRetweets(tweetId: string): Promise<string[]>;
    getFollowers(tweetId: string): Promise<string[]>;
    getQuotedReplies(tweetId: string): Promise<string[]>;
}

export class TwitterService implements ITwitterService {
    private client: TwitterApi;

    constructor() {
	this.client = new TwitterApi({
            appKey: CONFIG.TWITTER.APP_KEY!,
            appSecret: CONFIG.TWITTER.APP_SECRET!,
            accessToken: CONFIG.TWITTER.ACCESS_TOKEN!,
            accessSecret: CONFIG.TWITTER.ACCESS_SECRET!,
	});
    }

    async getTweetLikes(tweetId: string): Promise<string[]> {
        let userIds: string[] = [];
        const usersPaginated = await this.client.v2.tweetLikedBy(
	    tweetId, { asPaginator: true }
	);
	for await (const user of usersPaginated) {
            userIds.push(user.id);
	}
	return userIds;
    }

    async getTweetRetweets(tweetId: string): Promise<string[]> {
        let userIds: string[] = [];
        const usersPaginated = await this.client.v2.tweetRetweetedBy(
	    tweetId, { asPaginator: true }
	);
	for await (const user of usersPaginated) {
            userIds.push(user.id);
	}
	return userIds;
    }

    async getFollowers(tweetId: string): Promise<string[]> {
	let followerIds: string[] = [];
	const followersAsPaginator = await this.client.v2.followers(
	    tweetId, { asPaginator: true }
        );
	for await (const follower of followersAsPaginator) {
            followerIds.push(follower.id);
	}
	return followerIds;
    }

    async getQuotedReplies(tweetId: string): Promise<string[]> { // Comments
	let userIds: string[] = [];
        const quotes = await this.client.v2.quotes(
		tweetId, 
		{
		    expansions: ['author_id'],
		    'user.fields': ['username', 'url']
		}
	);
	for await (const quote of quotes) {
            const quoteTweetedAuthor =
		quotes.includes?.users?.find(user => user.id === quote.author_id);
	    if (quoteTweetedAuthor) {
		userIds.push(quoteTweetedAuthor.id);
	    }
	}
	return userIds;
    }

    async getTweetComments(tweetId: string): Promise<string[]> {
        let nextToken = null;
	const userIds: string[] = [];
	do {
            const params: Tweetv2SearchParams = {
                query: `conversation_id:${tweetId} is:reply`,
		expansions: `author_id`,
		'tweet.fields': ['created_at', 'conversation_id', 'in_reply_to_user_id'],
		'user.fields': ['username'],
		...(nextToken ? { next_token: nextToken } : {}),
	    };

	    const response: TweetSearchRecentV2Paginator = await this.client.v2.search(params);

	    if (response.tweets) {
	        response.tweets.forEach((tweet: TweetV2) => {
		    if (tweet.author_id && tweet.in_reply_to_user_id === tweetId) {
                        userIds.push(tweet.author_id);
		    }
                });
	    }
	    nextToken = response.meta.next_token;
	} while (nextToken);
	return userIds;
    }
}
