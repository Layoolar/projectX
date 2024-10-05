import { UserRepository } from '@domain/repositories';
import { User } from '@domain/models';
import { CustomError } from 'application/errors';
import { StatusCodes } from 'http-status-codes';

export interface IUserService {
    createUser(user: User): Promise<void>;
    getProfile(userId: string): Promise<User>;
    getLeaderboard(): Promise<User[] | []>;
    updateUserPoints(userId: string, tokens: number): Promise<void>;
    promoteUser(userId: string): Promise<void>;
    demoteUser(userId: string): Promise<void>;
}

export class UserService implements IUserService {
    constructor(private readonly userDBRepo: UserRepository) {}

    async createUser(user: User): Promise<void> {
        user.totalTokens =
            user.rewardTokens.claimed + user.rewardTokens.unclaimed;
        await this.userDBRepo.createUser(user);
    }

    async getProfile(userId: string): Promise<User> {
        const user = await this.userDBRepo.getUserById(userId);
        if (!user) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND);
        }
        return user;
    }

    async getLeaderboard(): Promise<User[] | []> {
        const users = await this.userDBRepo.getUsersOrderedByPoints();
        return users.slice(0, 10);
    }

    async getRank(userId: string): Promise<number> {
        const users = await this.userDBRepo.getUsersOrderedByPoints();
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            throw new CustomError('User not found', StatusCodes.NOT_FOUND);
        }
        const rank = userIndex + 1;
        return rank;
    }

    async updateUserPoints(userId: string, tokens: number): Promise<void> {
        await this.userDBRepo.updateUserPoints(userId, tokens);
    }

    async promoteUser(userId: string): Promise<void> {
        await this.userDBRepo.promoteUser(userId);
    }

    async demoteUser(userId: string): Promise<void> {
        await this.userDBRepo.demoteUser(userId);
    }
}
