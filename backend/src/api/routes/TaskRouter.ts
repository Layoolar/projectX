import { TaskController } from '@api/controllers';
import { taskDBRepo } from 'application/repoimpls';
import { TaskService } from 'application/services';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { TaskSchema, UpdateTaskSchema } from '@api/validation';
import { validateTask, validateUpdateTask } from '@api/middlewares';

export const taskRouter = Router();
export const adminTaskRouter = Router();

const taskService = new TaskService(taskDBRepo);
const taskController = new TaskController(taskService);

taskRouter.get(
    '/',
    expressAsyncHandler(taskController.getAllTasks.bind(taskController))
);

taskRouter.get(
    '/:id',
    expressAsyncHandler(taskController.getTask.bind(taskController))
);

adminTaskRouter.get(
    '/tasks',
    expressAsyncHandler(taskController.getAllTasksForAdmin.bind(taskController))
);

adminTaskRouter.post(
    '/task/create',
    validateTask(TaskSchema),
    expressAsyncHandler(taskController.createTask.bind(taskController))
);

adminTaskRouter.put(
    '/task/update',
    validateUpdateTask(UpdateTaskSchema),
    expressAsyncHandler(taskController.updateTask.bind(taskController))
);

adminTaskRouter.delete(
    '/task/:id',
    expressAsyncHandler(taskController.deleteTask.bind(taskController))
);

export default taskRouter;
