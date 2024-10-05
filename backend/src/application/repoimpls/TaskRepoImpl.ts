import { Task, UserTaskStatus } from '@domain/models';
import { TaskRepository } from '@domain/repositories';
import { MongoDatabase } from '@infrastructure/database/MongoDB';
import { getCurrentTimeStamp } from '@utils/utilsCommon';
import { UpdateTaskDTO } from 'application/dtos';
import { CustomError } from 'application/errors';
import { StatusCodes } from 'http-status-codes';

export class TaskRepositoryImpl implements TaskRepository {
    private readonly taskCollection;

    constructor(private readonly db: MongoDatabase) {
        this.taskCollection = this.db.getDb().collection<Task>('Task');
    }

    async getTask(taskId: string): Promise<Task | null> {
        return this.taskCollection.findOne(
            { id: taskId },
            { projection: { _id: 0 } }
        ) as Promise<Task | null>;
    }

    async getAllTasksForAdmin(): Promise<Task[] | []> {
        return this.taskCollection
            .find({}, { projection: { _id: 0 } })
            .toArray() as Promise<Task[] | []>;
    }

    async getAllTasks(userId: string): Promise<Task[] | []> {
        const res = await this.taskCollection
            .aggregate([
                {
                    $lookup: {
                        from: 'UserTask',
                        let: { taskId: '$id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$taskId', '$$taskId'],
                                            },
                                            { $eq: ['$userId', userId] },
                                        ],
                                    },
                                },
                            },
                            { $limit: 1 },
                        ],
                        as: 'userTaskMatch',
                    },
                },
                {
                    $addFields: {
                        status: {
                            $cond: {
                                if: { $gt: [{ $size: '$userTaskMatch' }, 0] },
                                then: {
                                    $arrayElemAt: ['$userTaskMatch.status', 0],
                                },
                                else: UserTaskStatus.UNCOMPLETED,
                            },
                        },
                        completed: {
                            $cond: {
                                if: {
                                    $and: [
                                        {
                                            $gt: [
                                                { $size: '$userTaskMatch' },
                                                0,
                                            ],
                                        },
                                        {
                                            $eq: [
                                                {
                                                    $arrayElemAt: [
                                                        '$userTaskMatch.status',
                                                        0,
                                                    ],
                                                },
                                                'completed',
                                            ],
                                        },
                                    ],
                                },
                                then: true,
                                else: false,
                            },
                        },
                    },
                },
                { $project: { userTaskMatch: 0, _id: 0 } },
            ])
            .toArray();
        return res as Task[] | [];
    }

    async createTask(task: Task): Promise<Task | null> {
        const result = await this.taskCollection.insertOne(task);
        if (!result.acknowledged) {
            return null;
        }
        return { ...task, _id: 0 } as Task;
    }

    async updateTask(
        taskId: string,
        updatedFields: UpdateTaskDTO
    ): Promise<Task | null> {
        const result = await this.taskCollection.findOneAndUpdate(
            { id: taskId },
            { $set: { ...updatedFields, updatedAt: getCurrentTimeStamp() } },
            { returnDocument: 'after', projection: { _id: 0 } }
        );
        return result as Task;
    }

    async deleteTask(taskId: string): Promise<void> {
        const result = await this.taskCollection.deleteOne({ id: taskId });
        if (result.deletedCount === 0) {
            throw new CustomError(
                'Task not found, unable to delete task',
                StatusCodes.NOT_FOUND
            );
        }
    }
}
