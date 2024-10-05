import { TaskAction } from '@domain/models';

export interface CreateTaskDTO {
    title: string;
    description: string;
    url: string;
    deadline: number;
    action: TaskAction;
    reward: number;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    url?: string;
    deadline?: number;
    action?: TaskAction;
}
