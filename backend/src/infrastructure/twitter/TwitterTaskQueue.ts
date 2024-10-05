import { Task, UserTaskStatus } from '@domain/models';
import { EventEmitter } from 'events';
import { commentTaskExec, handleTaskResult, VerificationResult } from './utils';
import { ApiResponseError } from 'twitter-api-v2';

export type TaskQueueItem = {
    userId: string;
    task: Task;
    status: UserTaskStatus;
    trials: number;
};

class TaskQueue extends EventEmitter {
    private queue: TaskQueueItem[] = [];
    private isProcessing = false;
    private rateLimitWindow: number;
    private lastExecutionTime: number;

    constructor(rateLimitWindow: number = 60 * 1000) {
        super();
        this.rateLimitWindow = rateLimitWindow;
        this.lastExecutionTime = 0;

        this.on('process', this.processQueue.bind(this));
    }

    // Add a task to the queue
    public addTask(task: TaskQueueItem) {
        this.queue.push(task);
        console.log('New task queued', this.queue.length);
        this.emit('process');
    }

    // Process the queue
    private processQueue() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        const processNext = async () => {
            if (this.queue.length === 0) {
                this.isProcessing = false;
                return;
            }

            const now = Date.now();
            const timeSinceLastExecution = now - this.lastExecutionTime;

            if (timeSinceLastExecution < this.rateLimitWindow) {
                const waitTime = this.rateLimitWindow - timeSinceLastExecution;
                console.log(
                    `Waiting for ${waitTime} ms before executing the next task.`
                );
                setTimeout(processNext, waitTime);
                return;
            }

            const task = this.queue.shift();
            if (task) {
                await this.executeTask(task);
            }
            this.lastExecutionTime = Date.now();

            // Immediately process the next task
            processNext();
        };

        processNext();
    }

    // Simulate task execution
    private async executeTask(task: TaskQueueItem) {
        try {
            console.log('Executing task:', task);
            const result: VerificationResult = await commentTaskExec(
                task.userId,
                task.task
            );
            await handleTaskResult(task.userId, task.task, result, true);
            console.log('Task executed successfully:', task, result);
        } catch (error) {
            console.log('Task execution failed:', task, error);
            if (
                error instanceof ApiResponseError &&
                (error.rateLimitError || error.code === 429)
            ) {
                console.log('Requeuing');
                this.addTask(task);
            }
            // Update task status in the database
            const mockResult: VerificationResult = {
                response: null,
                retryError: error,
                newAuth: null,
            };
            await handleTaskResult(task.userId, task.task, mockResult, true);
        }
    }
}

// Usage
export const taskQueue = new TaskQueue();
