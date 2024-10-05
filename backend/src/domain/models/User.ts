export enum Permission {
    ADMIN = 'admin',
    SUPER_ADMIN = 'superAdmin',
    USER = 'user',
}

export interface TwitterData {
    id: string;
    username: string;
    profile_image_url?: string;
}

export interface TwitterOAuthToken {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}

export interface Token {
    claimed: number;
    unclaimed: number;
    referralPoints: number;
}

export interface User {
    id: string;
    permission: Permission;
    rewardTokens: Token;
    totalTokens?: number;
    twitter: TwitterData;
    twitterOAuth: TwitterOAuthToken;
    createdAt: number;
    updatedAt: number;
    referralCode: string;
    referredBy?: string | null;
    referredUsers?: string[] | [];
    lastSpinAt?: number;
}
