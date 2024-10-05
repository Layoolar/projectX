import { Task } from '@domain/models';
import { generateRandomId, getCurrentTimeStamp } from '@utils/utilsCommon';
import { CreateTaskDTO, UpdateTaskDTO } from 'application/dtos/';
import { CustomError } from 'application/errors';
import { TaskRepositoryImpl } from 'application/repoimpls';
import { StatusCodes } from 'http-status-codes';

export interface ITaskService {
    getTask(taskId: string): Promise<Task>;
    getAllTasks(userId: string): Promise<Task[] | []>;
    getAllTasksForAdmin(): Promise<Task[] | []>;
    createTask(taskData: CreateTaskDTO): Promise<Task>;
    updateTask(taskId: string, updatedFields: UpdateTaskDTO): Promise<Task>;
    deleteTask(taskId: string): Promise<void>;
}

export class TaskService implements ITaskService {
    constructor(private readonly taskDBRepo: TaskRepositoryImpl) {}

    async getTask(taskId: string): Promise<Task> {
        const task = await this.taskDBRepo.getTask(taskId);
        if (!task) {
            throw new CustomError('Task not found', StatusCodes.NOT_FOUND);
        }
        return task;
    }

    async getAllTasks(userId: string): Promise<Task[] | []> {
        return this.taskDBRepo.getAllTasks(userId);
    }

    async getAllTasksForAdmin(): Promise<Task[] | []> {
        return this.taskDBRepo.getAllTasksForAdmin();
    }

    async createTask(taskData: CreateTaskDTO): Promise<Task> {
        const newTask: Task = {
            ...taskData,
            id: generateRandomId(),
            createdAt: getCurrentTimeStamp(),
            updatedAt: getCurrentTimeStamp(),
            deadline: taskData.deadline,
        };
        const savedTask = await this.taskDBRepo.createTask(newTask);
        if (!savedTask) {
            throw new CustomError(
                'Failed to create task',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        return savedTask;
    }

    async updateTask(
        taskId: string,
        updatedFields: UpdateTaskDTO
    ): Promise<Task> {
        const updatedTask = await this.taskDBRepo.updateTask(
            taskId,
            updatedFields
        );
        if (!updatedTask) {
            throw new CustomError(
                'Task not found, failed to update task',
                StatusCodes.NOT_FOUND
            );
        }
        return updatedTask;
    }

    async deleteTask(taskId: string) {
        return this.taskDBRepo.deleteTask(taskId);
    }
}
