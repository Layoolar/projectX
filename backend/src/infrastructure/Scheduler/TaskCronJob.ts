import { UserTaskStatus } from '@domain/models';
import { handleTaskResult } from '@infrastructure/twitter/utils';
import { extractId, makeTwitterRequestWithTokenRefresh, verifyRetweet, verifyTweetLike, verifyUserFollow } from '@utils/twitterapi';
import { CustomError } from 'application/errors';
import { taskDBRepo, userDBRepo, userTaskDBRepo, UserTaskRepositoryImpl } from 'application/repoimpls';
import { StatusCodes } from 'http-status-codes';
import cron from 'node-cron';

const taskThreshold = 100;

const actionMap: { [key: string]: any } = {
    like: verifyTweetLike,
    follow: verifyUserFollow,
    retweet: verifyRetweet,
    comment: verifyRetweet,
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
		await processTasks(userTaskDBRepo);
	    } else {
                console.log(`Only ${queuedTaskCount} tasks found. Waiting for more.`);
	    }
	} catch (error) {
            console.error('Error checking tasks:', error);
	}
    })
}

async function processTasks(
    userTaskRepo: UserTaskRepositoryImpl,
) {
    try {
	// let userTasksToUpdate = [];
        const userTasksToProcess = await userTaskRepo.fetchQueuedTasks(taskThreshold);

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

        /*
	const userIds = userTasksToUpdate.map((ut) => ut.userId);
	const taskIds = userTasksToUpdate.map((ut) => ut.taskId);
	await userTaskRepo
	    .updateUserTasksStatus(
		taskIds,
		userIds,
		UserTaskStatus.COMPLETED);
	*/

        console.log('Batch processing completed.');
    } catch (error) {
        console.error('Error processing tasks:', error);
    }
}

