import Joi from 'joi';
import { TaskAction } from '@domain/models';

export const TaskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    url: Joi.string().uri(),
    deadline: Joi.date().timestamp(),
    action: Joi.string()
        .valid(
            TaskAction.RETWEET,
            TaskAction.COMMENT,
            TaskAction.LIKE,
            TaskAction.FOLLOW
        )
        .required(),
    reward: Joi.number().positive().required(),
});

export const UpdateTaskSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    url: Joi.string().uri().optional(),
    deadline: Joi.date().timestamp(),
    action: Joi.string()
        .valid(...Object.values(TaskAction))
        .optional(),
    reward: Joi.number().optional(),
});
