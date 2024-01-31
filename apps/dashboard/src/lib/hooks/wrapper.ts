import { Wrapper } from '@yukako/wrapper';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export const useBaseWrapper = () => {
    const [wrapper] = useState(() => {
        const url = new URL(window.location.href);
        const base = `${url.protocol}//${url.host}`;

        return Wrapper(base);
    });

    return wrapper;
};

export const notifyAuthTokenChanged = () => {
    window.dispatchEvent(new Event('auth-token-changed'));
};

export const setAuthToken = (token: string) => {
    window.localStorage.setItem('auth-token', token);
    notifyAuthTokenChanged();
};

export const clearAuthToken = () => {
    window.localStorage.removeItem('auth-token');
    notifyAuthTokenChanged();
};

export const useWrapper = () => {
    const [location, setLocation] = useLocation();

    const createWrapper = () => {
        const url = new URL(window.location.href);
        const base = `${url.protocol}//${url.host}`;
        const authToken = window.localStorage.getItem('auth-token');

        if (!authToken) {
            if (location.startsWith('/auth')) {
                return Wrapper(base, 'invalid-auth-token-lmao');
            } else {
                setLocation('/auth');
                return Wrapper(base, 'invalid-auth-token-lmao');
            }
        }

        return Wrapper(base, authToken);
    };

    const [wrapper, setWrapper] = useState(createWrapper);

    useEffect(() => {
        const listener = () => {
            setWrapper(createWrapper());
        };

        window.addEventListener('auth-token-changed', listener);

        return () => {
            window.removeEventListener('auth-token-changed', listener);
        };
    }, [createWrapper, setWrapper]);

    return wrapper;
};
