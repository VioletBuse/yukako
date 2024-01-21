export type LoginResponse = {
    success: boolean;
    sessionId: string;
    uid: string;
};

export type RegisterResponse = {
    success: boolean;
    sessionId: string;
    uid: string;
};

export type NewAuthTokenResponse = {
    success: boolean;
    token: string;
};

export type MeResponse = {
    uid: string;
    username: string;
    sessionId: string;
};
