import { Request } from 'express';

export interface PostWithBodyRequest<T> extends Request {
    body: T;
}
