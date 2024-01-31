import {
    clearAuthToken,
    setAuthToken,
    useWrapper,
} from '@/lib/hooks/wrapper.ts';

export const useAuth = () => {
    const wrapper = useWrapper();

    const login = async (data: {
        username: string;
        password: string;
    }): Promise<[string, null] | [null, string]> => {
        const { username, password } = data;

        const [res, err] = await wrapper.auth.login({
            username,
            password,
        });

        if (res) {
            setAuthToken(res.sessionId);
            return [res.uid, null];
        } else {
            return [null, err];
        }
    };

    const logout = async () => {
        clearAuthToken();
    };

    const register = async (data: {
        username: string;
        password: string;
        newUserToken?: string | undefined | null;
    }): Promise<[string, null] | [null, string]> => {
        const { username, password } = data;

        const [res, err] = await wrapper.auth.register({
            username,
            password,
            newUserToken: data.newUserToken,
        });

        if (res) {
            setAuthToken(res.sessionId);
            return [res.uid, null];
        } else {
            return [null, err];
        }
    };

    return {
        login,
        logout,
        register,
    };
};
