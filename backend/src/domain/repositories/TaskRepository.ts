import { Task } from '@domain/models/';
import { UpdateTaskDTO } from 'application/dtos';

export interface TaskRepository {
    getTask(taskId: string): Promise<Task | null>;
    getAllTasksForAdmin(): Promise<Task[] | []>;
    getAllTasks(userId: string): Promise<Task[] | []>;
    createTask(task: Task): Promise<Task | null>;
    updateTask(
        taskId: string,
        updatedFields: UpdateTaskDTO
    ): Promise<Task | null>;
    deleteTask(taskId: string): Promise<void>;
}
