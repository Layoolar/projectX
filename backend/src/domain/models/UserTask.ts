export enum UserTaskStatus {
    QUEUED = 'queued',
    COMPLETED = 'completed',
    UNCOMPLETED = 'uncompleted',
    FAILED = 'failed',
}

export interface UserTask {
    taskId: string;
    userId: string;
    createdAt?: number;
    updatedAt: number;
    status: UserTaskStatus;
}
