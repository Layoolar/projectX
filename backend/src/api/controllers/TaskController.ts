import { jsonResponse } from '@utils/Response';
import { TaskService } from 'application/services';
import { RequestHandler, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    getTask: RequestHandler = async (req: Request, res: Response) => {
        const taskId = req.params.id;
        const task = await this.taskService.getTask(taskId);
        jsonResponse(res, StatusCodes.OK, '', task);
    };

    getAllTasks: RequestHandler = async (req: Request, res: Response) => {
        const data = await this.taskService.getAllTasks(req.user.id);
        return jsonResponse(res, StatusCodes.OK, '', data);
    };

    getAllTasksForAdmin: RequestHandler = async (_: Request, res: Response) => {
        const data = await this.taskService.getAllTasksForAdmin();
        return jsonResponse(res, StatusCodes.OK, '', data);
    };

    createTask: RequestHandler = async (req: Request, res: Response) => {
        const taskData = req.body;
        const createdTask = await this.taskService.createTask(taskData);
        return jsonResponse(
            res,
            StatusCodes.CREATED,
            'Task created successfully',
            createdTask
        );
    };

    updateTask: RequestHandler = async (req: Request, res: Response) => {
        const taskId = req.query.id as string;
        const updatedFields = req.body;
        const updatedTask = await this.taskService.updateTask(
            taskId,
            updatedFields
        );
        return jsonResponse(
            res,
            StatusCodes.OK,
            'Task updated successfully',
            updatedTask
        );
    };

    deleteTask: RequestHandler = async (req: Request, res: Response) => {
        const taskId = req.params.id;
        await this.taskService.deleteTask(taskId);
        return jsonResponse(res, StatusCodes.OK, 'Task deleted successfully');
    };
}
