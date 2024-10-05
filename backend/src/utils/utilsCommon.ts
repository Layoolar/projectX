import { randomUUID, randomBytes, createHash } from 'crypto';

export const getCurrentTimeStamp = () => {
    return new Date().getTime();
};

export const getStartOfTodayTimestamp = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
};

export const generateRandomId = (): string => {
    return randomUUID();
};

function base32Encode(buffer: Buffer) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';
    let val = 0;
    let valb = -5;

    for (let i = 0; i < buffer.length; i++) {
        val = (val << 8) | buffer[i];
        valb += 8;
        while (valb >= 0) {
            result += characters[(val >> valb) & 31];
            valb -= 5;
        }
    }
    return result;
}

export function generateReferralCode(userId: string) {
    const hash = createHash('sha256').update(userId).digest();
    const base32Hash = base32Encode(hash);
    const randomSuffix = randomBytes(1)
        .toString('hex')
        .toUpperCase()
        .slice(0, 2);
    const code = base32Hash.slice(0, 8) + randomSuffix;
    return code;
}
