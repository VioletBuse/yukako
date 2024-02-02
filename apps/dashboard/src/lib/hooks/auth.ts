import {
    clearAuthToken,
    setAuthToken,
    useAuthToken,
    useBaseWrapper,
    useServerUrl,
} from '@/lib/hooks/wrapper.ts';
import useSWR from 'swr';
import { Wrapper } from '@yukako/wrapper';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

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

type User = {
    uid: string;
    username: string;
    sessionId: string;
};

type UseUserResponse = { mutate: () => void } & (
    | {
          data: User;
          error: null;
          loading: false;
      }
    | {
          data: null;
          error: string;
          loading: false;
      }
    | {
          data: null;
          error: null;
          loading: true;
      }
);

export const useRequireLoggedIn = () => {
    const [, setLocation] = useLocation();
    const token = useAuthToken();
    const user = useUser();

    if (!token) {
        toast.message('You must be logged in to view this page.', {
            description: 'No login token found.',
        });
        setLocation('/auth');
    }

    if (!user.loading && !user.data) {
        toast.message('You must be logged in to view this page.', {
            description: `Error: ${user.error || 'Unknown error'}`,
        });
        setLocation('/auth');
    }
};

export const useUser = (): UseUserResponse => {
    const server = useServerUrl();
    const token = useAuthToken();

    const {
        data,
        error,
        mutate: _mut,
    } = useSWR(['/api/auth/me', server, token], ([, _server, _token]) => {
        return Wrapper(_server, _token ?? '').auth.me();
    });

    const mutate = () => {
        _mut();
    };

    if (error) {
        let message = 'An unknown error occurred.';

        if (typeof error === 'string') {
            message = error;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return {
            data: null,
            error: message,
            loading: false,
            mutate,
        };
    }

    if (data) {
        const [res, err] = data;

        if (err) {
            return {
                data: null,
                error: err,
                loading: false,
                mutate,
            };
        } else if (res) {
            return {
                data: {
                    uid: res.uid,
                    username: res.username,
                    sessionId: res.sessionId,
                },
                error: null,
                loading: false,
                mutate,
            };
        } else {
            return {
                data: null,
                error: 'An unknown error occurred.',
                loading: false,
                mutate,
            };
        }
    }

    return {
        data: null,
        error: null,
        loading: true,
        mutate,
    };
};
