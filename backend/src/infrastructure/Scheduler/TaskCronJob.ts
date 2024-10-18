import { UserTask, UserTaskStatus } from '@domain/models';
import { TwitterService } from '@infrastructure/twitter/TwitterService';
import CONFIG from '@main/config';
import { getCurrentTimeStamp } from '@utils/utilsCommon';
import { CustomError } from 'application/errors';
import { taskDBRepo, userDBRepo, userTaskDBRepo } from 'application/repoimpls';
import { StatusCodes } from 'http-status-codes';
import cron from 'node-cron';
import { ApiResponseError, TwitterApi } from 'twitter-api-v2';

const taskThreshold = 0;

const actionMap: { [key: string]: (client: TwitterApi, tweetUrl: string) => Promise<string[]> } = {
    like: (client, tweetUrl: string) => new TwitterService(client).getTweetLikes(tweetUrl),
    follow: (client, tweetUrl: string) => new TwitterService(client).getFollowers(tweetUrl),
    comment: (client, tweetUrl: string) => new TwitterService(client).getTweetComments(tweetUrl),
    retweet: (client, tweetUrl: string) => new TwitterService(client).getTweetRetweets(tweetUrl),
};

export const scheduleTaskProcessing = () => {
    cron.schedule('*/3 * * * *', async () => {
        console.log('Checking for queued tasks...');

	try {
            const queuedTaskCount =
		await userTaskDBRepo.countUserTasksByStatus(UserTaskStatus.UNCOMPLETED);

	    if (queuedTaskCount >= taskThreshold) {
                console.log(`Threshold reached with ${queuedTaskCount} tasks.
			    Processing batch...`);
		await processTasks();
	    } else {
                console.log(`Only ${queuedTaskCount} tasks found. Waiting for more.`);
	    }
	} catch (error) {
            console.error('Error checking tasks:', error);
	}
    })
}

async function processUserTasksForAction(
	userTasks: UserTask[], userIds: string[],
) {
    return Promise.all(
	userTasks.map(async (userTask) => {
            const user = await userDBRepo.getUserById(userTask.userId);
	    if (!user) {
	        throw new CustomError(
                    'User not found', StatusCodes.NOT_FOUND,
	        );
	    }
            if (userIds.includes(user.twitter.id)) {
                return userTask;
	    }
	    return null;
	})
    );
}


async function processTasks() {
    try {
	let userTasksToUpdate: UserTask[] = [];
        const userTasksToProcess = await userTaskDBRepo.fetchQueuedTasks(taskThreshold);
	const uniqueTaskIds = Array.from(new Set(userTasksToProcess.map(task => task.taskId)));
	console.log(uniqueTaskIds);

        await Promise.all(
            uniqueTaskIds.map(async (taskId) => {
	        const task = await taskDBRepo.getTask(taskId);
	        if (!task) throw new CustomError('Task not found', StatusCodes.NOT_FOUND);

	        const userTasksWithThisTaskId = userTasksToProcess.filter(
	            userTask => userTask.taskId === taskId
	        );
		const actionVerifier = actionMap[task.action.toLowerCase()];
	        
		if (actionVerifier) {
                    let user;
		    let client: TwitterApi | undefined;
		    let userRefreshToken: string | undefined;

		    for (const userTask of userTasksWithThisTaskId) {
		        try {
		            user = await userDBRepo.getUserById(userTask.userId);
			    console.log(user.twitter.username);
		            const userAccessToken = user.twitterOAuth.accessToken;
		            userRefreshToken = user.twitterOAuth.refreshToken;
		            client = new TwitterApi(userAccessToken);
	                    const userIds = await actionVerifier(client, task.url);
		            const validUserTasks = await processUserTasksForAction(
			        userTasksWithThisTaskId, userIds);
		            validUserTasks
                                .filter(Boolean)
                                .forEach((validTask) => {
                                    if (validTask) {
                                        userTasksToUpdate.push(validTask);
                                    }
                                });
			    break;
		        } catch (error: any) {
                            if (error instanceof ApiResponseError && error.rateLimitError) {
				const userLimitExceeded =
				    error.data && error.data.title === 'Too Many Requests';
				if (userLimitExceeded) {
                                    console.log('User Limit exceeded, switching user...');
				    throw error;
				    continue;
				}
                                console.log('Rate limit error: ', error.rateLimit);
			        throw error;
			    } else if (
			        (error instanceof ApiResponseError && error.isAuthError) ||
				error.code === 401 ||
                                error?.data?.code === 401
			    ){
			        console.log('Access token expired, trying to refresh token');
                                try {
				    const refreshClient = new TwitterApi({
				        clientId: CONFIG.TWITTER.CLIENT_ID,
                                        clientSecret: CONFIG.TWITTER.CLIENT_SECRET,
				    });
				    const newAuth =
				        await refreshClient.refreshOAuth2Token(userRefreshToken!);
				    console.log('New Auth: ', newAuth);
				    try {
                                        const userIds = await actionVerifier(
				            newAuth.client, task.url);
				        const validUserTasks = await processUserTasksForAction(
					    userTasksWithThisTaskId, userIds);
                                        validUserTasks.filter(Boolean).forEach((validTask) => {
                                            if (validTask) userTasksToUpdate.push(validTask);
                                        });
				        break;
				    } catch (retryError) {
                                        console.log('Retry request failed:', retryError);
				        throw retryError;
				    }
			        } catch (refreshError) {
                                    console.log('Token refresh failed:', refreshError);
				    continue;
			        }
			    } else {
			        console.log('Unhandled error:', error);
                                throw error;
			    }
		        }
	            }
		    console.log("ohhh yeahhh, it's all done");
		    console.log(userTasksToUpdate);
		    if (!client) {
                        console.log('No valid Twitter credentials available for the task');
                        throw new Error('Unable to process task due to invalid Twitter credentials.');
		    }
		}
	    })
        );

	await Promise.all(
            userTasksToUpdate.map(async (userTask) => {
	        console.log("got here!");
                const userId = userTask.userId;
                const task = await taskDBRepo.getTask(userTask.taskId);
                if (!task) throw new CustomError('Task not found', StatusCodes.NOT_FOUND);

                await userTaskDBRepo.createOrUpdateUserTask({
                    userId, taskId: task.id, createdAt: getCurrentTimeStamp(),
		    updatedAt: getCurrentTimeStamp(), status: UserTaskStatus.COMPLETED,
                });

                await userDBRepo.updateUserPoints(userId, task.reward);
                await userDBRepo.updateReferrerReward(userId, task.reward);

                console.log(`Updated task data for user ${userId} to completed`);
            })
        )
    } catch (error) {
        console.error('Error in processing tasks:', error);
        throw error;
    }
}

/*
        for (const userTask of userTasksToProcess) {
            console.log(`Processing task with ID: ${userTask.taskId}`);
	    const userId = userTask.userId;
	    const user = await userDBRepo.getUserById(userId);
	    if (!user) {
                throw new CustomError(
                    'User not found',
		    StatusCodes.NOT_FOUND,
		);
	    }
	    const taskId = userTask.taskId;
	    const task = await taskDBRepo.getTask(taskId);
	    if (!task) {
                throw new CustomError(
                    'Task not found',
		    StatusCodes.NOT_FOUND,
		);
	    }
	    const taskTweetId = extractId(task.url)
	    const dt1 = {
                taskTweetId,
		userId,
	    };

	    const actionFn = actionMap[task.action];
	    if (!actionFn) {
                console.error(`No function found for action: ${task.action}`);
		continue;
	    }
	    const result = await makeTwitterRequestWithTokenRefresh(
                user.twitterOAuth.accessToken,
		user.twitterOAuth.refreshToken ?? '',
		actionFn,
		dt1,
	    );
	    if (result.response) {
		await handleTaskResult(user.id, task, result);
	        // userTasksToUpdate.push({ userId, taskId });
	    }
        }

        
	const userIds = userTasksToUpdate.map((ut) => ut.userId);
	const taskIds = userTasksToUpdate.map((ut) => ut.taskId);
	await userTaskRepo
	    .updateUserTasksStatus(
		taskIds,
		userIds,
		UserTaskStatus.COMPLETED);
	

        console.log('Batch processing completed.');
    } catch (error) {
        console.error('Error processing tasks:', error);
    }
}
*/

