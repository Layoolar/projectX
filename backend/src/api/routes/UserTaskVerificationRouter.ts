import { UserTaskController } from '@api/controllers/UserTaskController';
import { taskDBRepo, userDBRepo, userTaskDBRepo } from 'application/repoimpls';
import { UserService, UserTaskService } from 'application/services';
import { VerificationService } from 'application/services/VerificationService';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const verificationRouter = Router();

const userService = new UserService(userDBRepo);
const verificationService = new VerificationService(
    taskDBRepo,
    userDBRepo,
    userTaskDBRepo
);
const userTaskService = new UserTaskService(userTaskDBRepo);
const userTaskController = new UserTaskController(
    verificationService,
    userTaskService,
    userService
);

verificationRouter.post(
    '/',
    expressAsyncHandler(
        userTaskController.verifyUserTask.bind(userTaskController)
    )
);

export default verificationRouter;
