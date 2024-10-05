import { PostWithBodyRequest } from '@utils/Request';
import { VerificationService } from 'application/services/VerificationService';
import { RequestHandler, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { jsonResponse } from '@utils/Response';
import { CustomError } from 'application/errors';
import { UserService, UserTaskService } from 'application/services';
import { UserTaskStatus } from '@domain/models';

export class UserTaskController {
    constructor(
        private readonly verificationService: VerificationService,
        private readonly userTaskService: UserTaskService,
        private readonly userService: UserService
    ) {}

    verifyUserTask: RequestHandler = async (
        req: PostWithBodyRequest<{
            taskId: string;
        }>,
        res: Response
    ) => {
        const user = req.user;
        const taskId = req.body.taskId;
        if (!taskId) {
            throw new CustomError(
                'task id is needed to verify task',
                StatusCodes.BAD_REQUEST
            );
        }
        await this.verificationService.verifyAction(user.id, taskId);
        return jsonResponse(
            res,
            StatusCodes.OK,
            'Task queued for verification',
            {
                completed: false,
                status: UserTaskStatus.QUEUED,
            }
        );
    };

    getUserTasks: RequestHandler = async (req: Request, res: Response) => {
        const data = await this.userTaskService.getUserTasks(req.user.id);
        return jsonResponse(
            res,
            StatusCodes.OK,
            'User task completion history',
            data as object
        );
    };
}
