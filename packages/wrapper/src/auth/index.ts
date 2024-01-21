import {
    LoginResponse,
    MeResponse,
    NewAuthTokenResponse,
    RegisterResponse,
} from '@yukako/types';

export const AuthWrapper = <T extends string | null | undefined = undefined>(
    server: string,
    sessionId: T,
) => ({
    login: async (opts: {
        username: string;
        password: string;
    }): Promise<[LoginResponse, null] | [null, string]> => {
        try {
            const resp = await fetch(`${server}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(opts),
            });

            if (!resp.ok) {
                try {
                    const json = await resp.json();
                    if ('error' in json && typeof json.error === 'string') {
                        return [null, json.error];
                    } else {
                        return [null, 'An unknown error occurred.'];
                    }
                } catch (err) {
                    return [null, 'An unknown error occurred.'];
                }
            } else {
                const json = await resp.json();
                if ('error' in json && typeof json.error === 'string') {
                    return [null, json.error];
                } else {
                    return [json, null];
                }
            }
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
    register: async (opts: {
        username: string;
        password: string;
        newUserToken?: string | null | undefined;
    }): Promise<[RegisterResponse, null] | [null, string]> => {
        try {
            const resp = await fetch(`${server}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(opts),
            });

            if (!resp.ok) {
                try {
                    const json = await resp.json();
                    if ('error' in json && typeof json.error === 'string') {
                        return [null, json.error];
                    } else {
                        return [null, 'An unknown error occurred.'];
                    }
                } catch (err) {
                    return [null, 'An unknown error occurred.'];
                }
            } else {
                const json = await resp.json();
                if ('error' in json && typeof json.error === 'string') {
                    return [null, json.error];
                } else {
                    return [json, null];
                }
            }
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
    createNewUserToken: async (): Promise<
        [NewAuthTokenResponse, null] | [null, string]
    > => {
        try {
            const resp = await fetch(`${server}/api/auth/new-user-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!resp.ok) {
                try {
                    const json = await resp.json();
                    if ('error' in json && typeof json.error === 'string') {
                        return [null, json.error];
                    } else {
                        return [null, 'An unknown error occurred.'];
                    }
                } catch (err) {
                    return [null, 'An unknown error occurred.'];
                }
            } else {
                const json = await resp.json();
                if ('error' in json && typeof json.error === 'string') {
                    return [null, json.error];
                } else {
                    return [json, null];
                }
            }
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
    me: async (): Promise<[MeResponse, null] | [null, string]> => {
        try {
            const resp = await fetch(`${server}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionId}`,
                },
            });

            if (!resp.ok) {
                try {
                    const json = await resp.json();
                    if ('error' in json && typeof json.error === 'string') {
                        return [null, json.error];
                    } else {
                        return [null, 'An unknown error occurred.'];
                    }
                } catch (err) {
                    return [null, 'An unknown error occurred.'];
                }
            } else {
                const json = await resp.json();
                if ('error' in json && typeof json.error === 'string') {
                    return [null, json.error];
                } else {
                    return [json, null];
                }
            }
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
