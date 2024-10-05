import { UserTask, UserTaskStatus } from '@domain/models/UserTask';

export interface UserTaskRepository {
    createOrUpdateUserTask(userTask: UserTask): Promise<void>;
    countUserTasksByStatus(status: UserTaskStatus): Promise<number>;
    fetchQueuedTasks(limit:number): Promise<UserTask[]>;
    updateUserTaskStatus(
        userId: string,
        taskId: string,
        status: UserTaskStatus
    ): Promise<void>;
    updateUserTasksStatus(
        userIds: string[],
        taskIds: string[],
        status: UserTaskStatus
    ): Promise<void>;
    getUserTaskByTaskId(
        taskId: string,
        userId: string
    ): Promise<UserTask | null>;
    getUserTasks(userId: string): Promise<unknown>;
}
