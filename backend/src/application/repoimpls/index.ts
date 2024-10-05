import { db } from '@infrastructure/database';
import { UserRepositoryImpl } from './UserRepoImpl';
import { TaskRepositoryImpl } from './TaskRepoImpl';
import { UserTaskRepositoryImpl } from './UserTaskRepoImpl';
import { ReferralRepositoryImpl } from './ReferralRepoImpl';

export * from './UserRepoImpl';
export * from './TaskRepoImpl';
export * from './UserTaskRepoImpl';
export * from './ReferralRepoImpl';

export const userDBRepo = new UserRepositoryImpl(db);
export const taskDBRepo = new TaskRepositoryImpl(db);
export const userTaskDBRepo = new UserTaskRepositoryImpl(db);
export const referralDBRepo = new ReferralRepositoryImpl(db);
