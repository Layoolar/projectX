import { Express } from 'express';
import { Permission } from '@domain/models';

interface RequestUserData {
    id: string;
    username: string;
    permission: Permission;
}

declare module 'express-serve-static-core' {
    interface Request {
        user: RequestUserData;
    }
}
