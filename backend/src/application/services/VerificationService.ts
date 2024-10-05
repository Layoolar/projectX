import { TaskAction, UserTask, UserTaskStatus } from '@domain/models';
import {
    taskQueue,
    TaskQueueItem,
} from '@infrastructure/twitter/TwitterTaskQueue';
import {
    handleTaskResult,
    VerificationResult,
} from '@infrastructure/twitter/utils';
import {
    extractId,
    verifyRetweet,
    verifyTweetLike,
    makeTwitterRequestWithTokenRefresh,
} from '@utils/twitterapi';
import { getCurrentTimeStamp } from '@utils/utilsCommon';
import { CustomError } from 'application/errors';
import {
    TaskRepositoryImpl,
    UserRepositoryImpl,
    UserTaskRepositoryImpl,
} from 'application/repoimpls';
import { StatusCodes } from 'http-status-codes';

export class VerificationService {
    constructor(
        private readonly taskDBRepo: TaskRepositoryImpl,
        private readonly userDBRepo: UserRepositoryImpl,
        private readonly userTaskDBRepo: UserTaskRepositoryImpl
    ) {}

    async verifyAction(userId: string, taskId: string) {
        const task = await this.taskDBRepo.getTask(taskId);
        if (!task) {
            throw new CustomError('Task not found', StatusCodes.NOT_FOUND);
        }
        const user = await this.userDBRepo.getUserById(userId);
        if (!user) {
            throw new CustomError(
                'User not found, login required',
                StatusCodes.UNAUTHORIZED
            );
        }

        const taskExists = await this.userTaskDBRepo.getUserTaskByTaskId(
            taskId,
            userId
        );

        if (taskExists && taskExists.status === UserTaskStatus.QUEUED) {
            throw new CustomError(
                'Task verification pending',
                StatusCodes.BAD_REQUEST
            );
        } else if (
            taskExists &&
            taskExists.status === UserTaskStatus.COMPLETED
        ) {
            throw new CustomError(
                'You have already done this task',
                StatusCodes.BAD_REQUEST
            );
        }
        const taskTweetId = extractId(task.url);
        if (!taskTweetId) {
            throw new CustomError(
                'Unable to extract id from task',
                StatusCodes.BAD_REQUEST
            );
        }
	const newUserTask: UserTask = {
            userId,
            taskId: task.id,
	    createdAt: getCurrentTimeStamp(),
	    updatedAt: getCurrentTimeStamp(),
	    status: UserTaskStatus.UNCOMPLETED,
	};
        await this.userTaskDBRepo.createOrUpdateUserTask(newUserTask);
    }
}
/*
        if (task.action === TaskAction.COMMENT) {
            //FIXME Update pending status for usertask
            const taskQueueData: TaskQueueItem = {
                userId: user.id,
                task,
                status: UserTaskStatus.QUEUED,
                trials: 0,
            };
            taskQueue.addTask(taskQueueData);
            // create or update new task with pending status
            const newUserTask: UserTask = {
                userId,
                taskId: task.id,
                createdAt: getCurrentTimeStamp(),
                updatedAt: getCurrentTimeStamp(),
                status: UserTaskStatus.QUEUED,
            };
            await this.userTaskDBRepo.createOrUpdateUserTask(newUserTask);
            return {
                completed: false,
                status: UserTaskStatus.QUEUED,
            };
        }

        let result: VerificationResult;

        switch (task.action) {
	    case TaskAction.COMMENT: {
	        const taskQueueData: TaskQueueItem = {
		    userId: user.id,
		    task,
		    status: UserTaskStatus.QUEUED,
		    trials: 0,
		};
		taskQueue.addTask(taskQueueData);
		const newUserTask: UserTask = {
                userId,
		    taskId: task.id,
		    createdAt: getCurrentTimeStamp(),
		    updatedAt: getCurrentTimeStamp(),
		    status: UserTaskStatus.QUEUED,
		};
		await this.userTaskDBRepo.createOrUpdateUserTask(newUserTask);
		return {
                    completed: false,
		    status: UserTaskStatus.QUEUED,
		}
	    }
            case TaskAction.RETWEET: {
                const taskTweetId = extractId(task.url);
                if (!taskTweetId) {
                    throw new CustomError(
                        'Unable to extract id from task',
                        StatusCodes.BAD_REQUEST
                    );
                }
	        const newUserTask: UserTask = {
                    userId,
                    taskId: task.id,
	            createdAt: getCurrentTimeStamp(),
	            updatedAt: getCurrentTimeStamp(),
	            status: UserTaskStatus.UNCOMPLETED,
	        };
                await this.userTaskDBRepo.createOrUpdateUserTask(newUserTask);
		await this.userDBRepo.updateUserPoints(userId, task.reward);
		await this.userDBRepo.updateReferrerReward(userId, task.reward);
		console.log('Updated task data to completed!!!');
		return;
                const dt1 = {
                    taskTweetId,
                    userId: user.id,
                };
                result = await makeTwitterRequestWithTokenRefresh(
                    user.twitterOAuth.accessToken,
                    user.twitterOAuth.refreshToken ?? '',
                    verifyRetweet,
                    dt1
                );
                break;
            }
            case TaskAction.LIKE: {
                const taskTweetId = extractId(task.url);
                if (!taskTweetId) {
                    throw new CustomError(
                        'Unable to extract id from task',
                        StatusCodes.BAD_REQUEST
                    );
                }
		const newUserTask: UserTask = {
                    userId,
		    taskId: task.id,
		    createdAt: getCurrentTimeStamp(),
		    updatedAt: getCurrentTimeStamp(),
		    status: UserTaskStatus.COMPLETED,
		};
		await this.userTaskDBRepo.createOrUpdateUserTask(newUserTask);
		await this.userDBRepo.updateUserPoints(userId, task.reward);
		await this.userDBRepo.updateReferrerReward(userId, task.reward);
		console.log('Updated task data to completed!!!');
		return;
		/*const dt1 = {
		    taskTweetId,
                    userId: user.id,
		};
                result = await makeTwitterRequestWithTokenRefresh(
                    user.twitterOAuth.accessToken,
                    user.twitterOAuth.refreshToken ?? '',
                    verifyTweetLike,
                    dt1
                );
                break;
            }
            case TaskAction.FOLLOW: {
                result = {
                    response: true,
                    newAuth: null,
                    retryError: null,
                };
                //const acccountToFollowUsername = extractUsername(task.url);
                //if (!acccountToFollowUsername) {
                //    throw new CustomError(
                //        'Unable to extract username from task',
                //        StatusCodes.BAD_REQUEST
                //    );
                //}
                //const dt1 = {
                //    atfu: acccountToFollowUsername,
                //    userId: user.id,
                //};
                //result = await makeTwitterRequestWithTokenRefresh(
                //    user.twitterOAuth.accessToken,
                //    user.twitterOAuth.refreshToken ?? '',
                //    verifyUserFollow,
                //    dt1
                //);
                break;
            }
            default:
                throw new CustomError(
                    'Invalid action',
                    StatusCodes.BAD_REQUEST
                );
        }
        // await handleTaskResult(user.id, task, result);
    }
}
*/
