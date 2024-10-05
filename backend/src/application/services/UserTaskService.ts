import { Task, UserTask } from '@domain/models';
import { CustomError } from 'application/errors';
import { UserTaskRepositoryImpl } from 'application/repoimpls/UserTaskRepoImpl';
import { StatusCodes } from 'http-status-codes';

export interface IUserTaskService {
    createUserTask(userTask: UserTask, task: Task): Promise<void>;
    getUserTask(userId: string, taskId: string): Promise<UserTask>;
    getUserTasks(userId: string): Promise<unknown>;
}

export class UserTaskService implements IUserTaskService {
    constructor(private readonly userTaskDBRepo: UserTaskRepositoryImpl) {}

    async createUserTask(userTaskData: UserTask): Promise<void> {
        await this.userTaskDBRepo.createOrUpdateUserTask(userTaskData);
    }

    async getUserTask(userId: string, taskId: string): Promise<UserTask> {
        const userTask = await this.userTaskDBRepo.getUserTaskByTaskId(
            taskId,
            userId
        );
        if (!userTask) {
            throw new CustomError('User task not found', StatusCodes.NOT_FOUND);
        }
        return userTask;
    }

    async getUserTasks(userId: string): Promise<unknown> {
        return this.userTaskDBRepo.getUserTasks(userId);
    }
}
