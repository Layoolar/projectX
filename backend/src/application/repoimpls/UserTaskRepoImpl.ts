import { User } from '@domain/models';
import { UserTask, UserTaskStatus } from '@domain/models/UserTask';
import { UserTaskRepository } from '@domain/repositories';
import { MongoDatabase } from '@infrastructure/database/MongoDB';

export class UserTaskRepositoryImpl implements UserTaskRepository {
    private readonly userTaskCollection;
    private readonly userCollection;

    constructor(private readonly db: MongoDatabase) {
        this.userTaskCollection = this.db
            .getDb()
            .collection<UserTask>('UserTask');
        this.userCollection = this.db.getDb().collection<User>('User');
    }

    async createOrUpdateUserTask(userTask: UserTask): Promise<void> {
        const session = this.db.startSession();
        console.log('creating or updating task');
        try {
            await session.withTransaction(async () => {
                await this.userTaskCollection.updateOne(
                    { userId: userTask.userId, taskId: userTask.taskId },
                    { $set: userTask },
                    { upsert: true, session }
                );
            });
        } catch (error) {
            throw new Error((error as Error).message);
        } finally {
            session.endSession();
        }
    }

    async countUserTasksByStatus(status: UserTaskStatus): Promise<number> {
        return await this.userTaskCollection.countDocuments({ status });
    }

    async fetchQueuedTasks(limit:number): Promise<UserTask[]> {
        return await this.userTaskCollection
	    .find({ status: UserTaskStatus.UNCOMPLETED })
	    .limit(limit)
	    .toArray();
    }

    async updateUserTaskStatus(
        userId: string,
        taskId: string,
        status: UserTaskStatus
    ): Promise<void> {
        const session = this.db.startSession();
        try {
            await session.withTransaction(async () => {
                await this.userTaskCollection.updateOne(
                    { userId, taskId },
                    {
                        $set: { status },
                    },
                    { session }
                );
            });
        } catch (error) {
            throw new Error((error as Error).message);
        } finally {
            session.endSession();
        }
    }

    async updateUserTasksStatus(
	userIds: string[],
	taskIds: string[],
	status: UserTaskStatus
    ): Promise<void> {
	const session = this.db.startSession();
	try {
	    await session.withTransaction(async () => {
                await this.userTaskCollection.updateMany(
		    {
			taskId: { $in: taskIds },
			userId: { $in: userIds }
		    },
		    {
                        $set: { status }
		    }
	        );
	    });
	} catch (error) {
            throw new Error((error as Error).message);
	} finally {
            session.endSession();
	}
    }

    async getUserTaskByTaskId(
        taskId: string,
        userId: string
    ): Promise<UserTask | null> {
        const userTask = await this.userTaskCollection.findOne(
            {
                taskId,
                userId,
            },
            { projection: { _id: 0 } }
        );
        return userTask;
    }

    async getUserTasks(userId: string): Promise<unknown> {
        const userTasks = await this.userTaskCollection
            .aggregate([
                {
                    $match: {
                        userId,
                    },
                },
                {
                    $lookup: {
                        from: 'Task',
                        localField: 'taskId',
                        foreignField: 'id',
                        as: 'task',
                    },
                },
                {
                    $unwind: '$task',
                },
            ])
            .toArray();
        return userTasks as unknown;
    }
}
