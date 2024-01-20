import { LoginResponse } from '@yukako/types';

export const AuthWrapper = (server: string) => ({
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
});
