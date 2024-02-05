import {
    clearAuthToken,
    setAuthToken,
    useAuthToken,
    useBaseWrapper,
    useServerUrl,
} from '@/lib/hooks/wrapper.ts';
import useSWR from 'swr';
import { PassthroughWrapper } from '@yukako/wrapper';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useValidateSWRResponse } from '@/lib/hooks/hook-helpers';
import { AuthMeResponseBodySchema } from '@yukako/types';

export const useAuth = () => {
    const wrapper = useBaseWrapper();

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

export const useRequireLoggedIn = () => {
    const [, setLocation] = useLocation();
    const token = useAuthToken();
    const [userData, userError, userLoading] = useUser();

    if (!token) {
        toast.message('You must be logged in to view this page.', {
            description: 'No login token found.',
        });
        setLocation('/auth');
    }

    if (!userLoading && !userData) {
        toast.message('You must be logged in to view this page.', {
            description: `Error: ${userError || 'Unknown error'}`,
        });
        setLocation('/auth');
    }
};

export const useUser = () => {
    const server = useServerUrl();
    const token = useAuthToken();

    const res = useSWR(
        ['/api/auth/me', server, token],
        ([, _server, _token]) => {
            return PassthroughWrapper(_server, _token ?? '').auth.me();
        },
    );

    return useValidateSWRResponse(AuthMeResponseBodySchema, res);
};
