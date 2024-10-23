import CONFIG from "@main/config";
import { TwitterApi, TweetV2, TweetSearchRecentV2Paginator, Tweetv2SearchParams } from "twitter-api-v2";
import { extractId, extractUsername } from '@utils/twitterapi'
import { CustomError } from 'application/errors';
import { StatusCodes } from 'http-status-codes';

export interface ITwitterService {
    getTweetLikes(tweetId: string): Promise<string[]>,
    getTweetRetweets(tweetId: string): Promise<string[]>;
    getFollowers(tweetId: string): Promise<string[]>;
    getQuotedReplies(tweetId: string): Promise<string[]>;
}

export class TwitterService implements ITwitterService {
    private client: TwitterApi;

    constructor(client: TwitterApi) {
	this.client = client;
    }

    async getTweetLikes(tweetUrl: string): Promise<string[]> {
	console.log("Likes");
	const tweetId = extractId(tweetUrl);
	if (!tweetId) {
            throw new CustomError('Unable to extract id from task', StatusCodes.BAD_REQUEST);
	}
        let userIds: string[] = [];
        const usersPaginated = await this.client.v2.tweetLikedBy(
	    tweetId, { asPaginator: true }
	);
	console.log("Like worked!")
	for await (const user of usersPaginated) {
            userIds.push(user.id);
	}
	return userIds;
    }

    async getTweetRetweets(tweetUrl: string): Promise<string[]> {
	console.log("Retweets");
	const tweetId = extractId(tweetUrl);
	if (!tweetId) {
            throw new CustomError('Unable to extract id from task', StatusCodes.BAD_REQUEST);
	}
	let userIds: string[] = [];
        const usersPaginated = await this.client.v2.tweetRetweetedBy(
	    tweetId, { asPaginator: true }
	);
	console.log("Retweet worked!", usersPaginated);
	for await (const user of usersPaginated) {
	    console.log(user);
            userIds.push(user.id);
	}
	return userIds;
    }

    async getFollowers(tweetUrl: string): Promise<string[]> {
	console.log("Followers");
	const username = extractUsername(tweetUrl);
	if (!username) {
            throw new CustomError('Unable to extract username from task', StatusCodes.BAD_REQUEST);
	}
	const user = await this.client.v2.userByUsername(username);
	const userId = user.data.id;
	console.log("User worked!", userId);
	let followerIds: string[] = [];
	let followersAsPaginator = await this.client.v2.followers(
	    userId, { asPaginator: true }
        );
	console.log("Followers worked!", followersAsPaginator);
	do {
	    if (followersAsPaginator) {
	        for await (const follower of followersAsPaginator) {
                    followerIds.push(follower.id);
	        }
	    }
	    if (followersAsPaginator.meta && followersAsPaginator.meta.next_token) {
                followersAsPaginator = await followersAsPaginator.next();
            } else {
		break;
	    }
	} while (followersAsPaginator.meta && followersAsPaginator.meta.next_token);
	return followerIds;
    }

    async getQuotedReplies(tweetUrl: string): Promise<string[]> {
	const tweetId = extractId(tweetUrl);
	if (!tweetId) {
            throw new CustomError('Unable to extract id from task', StatusCodes.BAD_REQUEST);
	}
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

    async getTweetComments(tweetUrl: string): Promise<string[]> {
	console.log("Comments");
	const username = extractUsername(tweetUrl);
	if (!username) {
            throw new CustomError('Unable to extract username from task', StatusCodes.BAD_REQUEST);
	}
	const user = await this.client.v2.userByUsername(username);
	const userId = user.data.id;
	const tweetId = extractId(tweetUrl);
	if (!tweetId) {
            throw new CustomError('Unable to extract id from task', StatusCodes.BAD_REQUEST);
	}
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
	    console.log("Comments Worked!", response);
	    const mainTweetResponse = await this.client.v2.singleTweet(tweetId, {
                'tweet.fields': ['text', 'author_id', 'created_at']
	    });
	    const mainTweet: TweetV2 = mainTweetResponse.data;

	    if (response.tweets) {
		console.log(response.tweets);
	        response.tweets.forEach((tweet: TweetV2) => {
		    if (tweet.author_id &&
			tweet.in_reply_to_user_id === userId &&
			this.confirmHashtags(tweet.text, mainTweet.text)) {
                        userIds.push(tweet.author_id);
		    }
                });
	    }
	    nextToken = response.meta.next_token;
	} while (nextToken);
	return userIds;
    }

    confirmHashtags(userTweet: string, mainTweetText: string): boolean {
        const hashtags: string[] = mainTweetText.match(/#\w+/g) || [];
        return hashtags.every(str => userTweet.includes(str));
    }
}
