import { ReferralStats } from '@domain/models';

export interface ReferralRepository {
    fetchReferralCode(userId: string): Promise<string | null>;
    saveReferralCode(userId: string, referralCode: string): Promise<void>;
    updateRefereeByReferredBy(
        refereeId: string,
        referrerId: string
    ): Promise<void>;
    updateReferrerByReferredUsers(
        referrerId: string,
        refereeId: string
    ): Promise<void>;
    fetchReferralStats(userId: string): Promise<ReferralStats>;
}
