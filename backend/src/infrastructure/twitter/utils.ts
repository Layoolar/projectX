import { Task, UserTaskStatus } from '@domain/models';
import {
    extractId,
    makeTwitterRequestWithTokenRefresh,
    verifyComment,
} from '@utils/twitterapi';
import { getCurrentTimeStamp } from '@utils/utilsCommon';
import { CustomError } from 'application/errors';
import { userDBRepo, userTaskDBRepo } from 'application/repoimpls';
import { StatusCodes } from 'http-status-codes';
import { IParsedOAuth2TokenResult } from 'twitter-api-v2';

export type VerificationResult = {
    response: boolean | null;
    newAuth: IParsedOAuth2TokenResult | null;
    retryError: unknown | null;
};

export async function handleTaskResult(
    userId: string,
    task: Task,
    result: VerificationResult,
    fromQueue: boolean = false
) {
    try {
        if (result.newAuth) {
            await userDBRepo.updateUserTwitterAuth(userId, {
                accessToken: result.newAuth.accessToken,
                refreshToken: result.newAuth.refreshToken,
                expiresIn: result.newAuth.expiresIn,
            });
        }

        if (result.retryError) {
            throw result.retryError;
        }

        if (!result.response) {
            if (fromQueue) {
                const newUserTask = {
                    userId,
                    taskId: task.id,
                    updatedAt: getCurrentTimeStamp(),
                    status: UserTaskStatus.FAILED,
                };
                await userTaskDBRepo.createOrUpdateUserTask(newUserTask);
            }
            throw new CustomError(
                'Task verification failed!',
                StatusCodes.BAD_REQUEST,
                {
                    completed: false,
                }
            );
        }

        let newUserTask = {
            userId,
            taskId: task.id,
            createdAt: getCurrentTimeStamp(),
            updatedAt: getCurrentTimeStamp(),
            status: UserTaskStatus.COMPLETED,
        };

        if (!fromQueue) {
            newUserTask = {
                ...newUserTask,
                createdAt: getCurrentTimeStamp(),
            };
        }
        // Ensure task update success
        await userTaskDBRepo.createOrUpdateUserTask(newUserTask);
        await userDBRepo.updateUserPoints(userId, task.reward);
        await userDBRepo.updateReferrerReward(userId, task.reward);
        console.log('Updated task data to completed!!!');
    } catch (error) {
        console.error('Error in handleTaskResult:', error);
        throw error; // Re-throw the error for higher-level handling
    }
}

export async function commentTaskExec(userId: string, task: Task) {
    const user = await userDBRepo.getUserById(userId);
    const taskTweetId = extractId(task.url);
    if (!taskTweetId) {
        throw new CustomError(
            'Unable to extract id from task',
            StatusCodes.BAD_REQUEST
        );
    }
    const dt1 = {
        taskTweetId,
        userId: user.id,
    };
    try {
        const result = await makeTwitterRequestWithTokenRefresh(
            user.twitterOAuth.accessToken,
            user.twitterOAuth.refreshToken ?? '',
            verifyComment,
            dt1
        );

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
