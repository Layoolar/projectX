import { UserController, UserTaskController } from '@api/controllers';
import { UserService } from 'application/services/UserService';
import { userDBRepo, taskDBRepo, userTaskDBRepo } from 'application/repoimpls';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { VerificationService } from 'application/services/VerificationService';
import { UserTaskService } from 'application/services';

export const userRouter = Router();
export const adminUserRouter = Router();

const userService = new UserService(userDBRepo);
const userController = new UserController(userService);

const userTaskService = new UserTaskService(userTaskDBRepo);
const verificationService = new VerificationService(
    taskDBRepo,
    userDBRepo,
    userTaskDBRepo
);
const userTaskController = new UserTaskController(
    verificationService,
    userTaskService,
    userService
);

// NOTE this route does not need to be exposed
//userRouter.post(
//    '/user/create',
//    expressAsyncHandler(userController.createUser.bind(userController))
//);

userRouter.get(
    '/profile',
    expressAsyncHandler(userController.getProfile.bind(userController))
);

userRouter.get(
    '/tasks/history',
    expressAsyncHandler(
        userTaskController.getUserTasks.bind(userTaskController)
    )
);

userRouter.get(
    '/leaderboard',
    expressAsyncHandler(userController.getLeaderboard.bind(userController))
);

userRouter.get(
    '/rank',
    expressAsyncHandler(userController.getUserRank.bind(userController))
);

adminUserRouter.get(
    '/user/promote',
    expressAsyncHandler(userController.promoteUser.bind(userController))
);

adminUserRouter.get(
    '/user/demote',
    expressAsyncHandler(userController.demoteUser.bind(userController))
);

export default userRouter;
