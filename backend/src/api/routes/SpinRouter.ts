import { SpinService } from 'application/services/SpinService';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { userDBRepo } from 'application/repoimpls';
import { SpinController } from '@api/controllers/SpinController';

export const spinRouter = Router();

const spinService = new SpinService(userDBRepo);
const spinController = new SpinController(spinService);

spinRouter.post(
    '/',
    expressAsyncHandler(spinController.spin.bind(spinController))
);

export default spinRouter;
