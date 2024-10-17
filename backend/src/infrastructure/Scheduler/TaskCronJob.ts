import { UserTask, UserTaskStatus } from '@domain/models';
import { TwitterService } from '@infrastructure/twitter/TwitterService';
import { extractId, makeTwitterRequestWithTokenRefresh, verifyRetweet, verifyTweetLike, verifyUserFollow } from '@utils/twitterapi';
import { getCurrentTimeStamp } from '@utils/utilsCommon';
import { CustomError } from 'application/errors';
import { taskDBRepo, TaskRepositoryImpl, userDBRepo, UserRepositoryImpl, userTaskDBRepo, UserTaskRepositoryImpl } from 'application/repoimpls';
import { StatusCodes } from 'http-status-codes';
import cron from 'node-cron';

const taskThreshold = 0;

const actionMap: { [key: string]: (tweetId: string) => Promise<string[]> } = {
    like: (tweetId: string) => new TwitterService().getTweetLikes(tweetId),
    follow: (tweetId: string) => new TwitterService().getFollowers(tweetId),
    comment: (tweetId: string) => new TwitterService().getTweetComments(tweetId),
    retweet: (tweetId: string) => new TwitterService().getTweetRetweets(tweetId),
};

export const scheduleTaskProcessing = () => {
    cron.schedule('*/5 * * * *', async () => {
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
	userTasks: UserTask[], userIds: string[], userDBRepo: UserRepositoryImpl,
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

        await Promise.all(
            uniqueTaskIds.map(async (taskId) => {
	        const task = await taskDBRepo.getTask(taskId);
	        if (!task) throw new CustomError('Task not found', StatusCodes.NOT_FOUND);

		const taskTweetId = extractId(task.url);
	        if (!taskTweetId) throw new CustomError(
			'Unable to extract id from task', StatusCodes.BAD_REQUEST
		);

	        const userTasksWithThisTaskId = userTasksToProcess.filter(
	            userTask => userTask.taskId === taskId
	        );
		const actionVerifier = actionMap[task.action.toLowerCase()];
	        
		if (actionVerifier) {
	            const userIds = await actionVerifier(taskTweetId);
		    const validUserTasks = await processUserTasksForAction(
			    userTasksWithThisTaskId, userIds, userDBRepo
		    );

		    validUserTasks
                        .filter(Boolean)
                        .forEach((validTask) => {
                            if (validTask) {
                                userTasksToUpdate.push(validTask);
                            }
                        });
	        }
	    })
        );

	await Promise.all(
            userTasksToUpdate.map(async (userTask) => {
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

