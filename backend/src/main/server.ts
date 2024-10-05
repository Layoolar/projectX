import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import hpp from 'hpp';
import {
    adminMiddleware,
    requestLogger,
    superAdminMiddleware,
    userAuthMiddleware,
} from '@api/middlewares';
import CONFIG from '@main/config';
import {
    catchAllErrorHandler,
    notFoundErrorHandler,
} from '@api/middlewares/ErrorHandlerMiddleware';
import taskRouter, { adminTaskRouter } from '@api/routes/TaskRouter';
import authRouter from '@api/routes/AuthRouter';
import userRouter, { adminUserRouter } from '@api/routes/UserRouter';
import verificationRouter from '@api/routes/UserTaskVerificationRouter';
import { db } from '@infrastructure/database';
import helmet from 'helmet';
import referralRouter from '@api/routes/ReferralRouter';
import spinRouter from '@api/routes/SpinRouter';

// Initializing express app instance
const app = express();

const corsOptions = {
    origin: [CONFIG.FRONTEND_URL],
    optionsSuccessStatus: 200,
    credentials: true,
};

if (CONFIG.ENV === 'development') {
    corsOptions.origin.push('http://127.0.0.1:3000');
}

if (CONFIG.ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(hpp());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
//app.use(session(sessionOptions));
app.use(requestLogger);

const port = CONFIG.PORT || 3000;

app.get('/', (_: Request, res: Response) => {
    res.send('Hello, Welcome to dmarqt home route!');
});

// All routes from here use userMiddleware
app.use('/api/auth/', authRouter);
//app.use(userAuthMiddlewares);
app.use('/api/tasks/', userAuthMiddleware, taskRouter);
app.use('/api/user/', userAuthMiddleware, userRouter);
app.use('/api/verify/', userAuthMiddleware, verificationRouter);
app.use('/api/referral/', userAuthMiddleware, referralRouter);
app.use('/api/spin-the-wheel', userAuthMiddleware, spinRouter);

app.use('/api/admin/', userAuthMiddleware, adminMiddleware, adminTaskRouter);

app.use(
    '/api/admin/',
    userAuthMiddleware,
    superAdminMiddleware,
    adminUserRouter
);
app.use(
    '/api/admin/',
    userAuthMiddleware,
    superAdminMiddleware,
    adminTaskRouter
);

// Error Middlewares and Handlers
app.use(notFoundErrorHandler);
app.use(catchAllErrorHandler);

let server;
db.connect().then(
    () => {
        server = app.listen(port, () => {
            console.log(
                '  App is running at http://localhost:%d in %s mode',
                port,
                app.get('env')
            );
        });
    },
    () => {
        console.log('Could not connect to mongodb');
    }
);

export default server;
