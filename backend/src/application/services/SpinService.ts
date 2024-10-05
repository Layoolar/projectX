import { CustomError } from 'application/errors';
import { UserRepositoryImpl } from 'application/repoimpls';
import { StatusCodes } from 'http-status-codes';
import { getStartOfTodayTimestamp } from '@utils/utilsCommon';
import { spinTheWheel } from '@utils/spinTheWheel';
import { getCurrentTimeStamp } from '@utils/utilsCommon';

export class SpinService {
    constructor(private readonly userDBRepo: UserRepositoryImpl) {}

    async spinWheel(userId: string) {
        const user = await this.userDBRepo.getUserById(userId);
        if (!user) {
            throw new CustomError('User not found', StatusCodes.UNAUTHORIZED);
        }

        const startOfToday = getStartOfTodayTimestamp();
        if (user.lastSpinAt && user.lastSpinAt >= startOfToday) {
            throw new CustomError(
                'You can only spin the wheel once per day',
                StatusCodes.FORBIDDEN
            );
        }

        const reward = spinTheWheel();
        const spinAt = getCurrentTimeStamp();
        await this.userDBRepo.updateUserPoints(userId, reward);
        await this.userDBRepo.updateUserSpinAt(userId, spinAt);
        return reward;
    }
}
