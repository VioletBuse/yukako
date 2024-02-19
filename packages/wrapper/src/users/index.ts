import {
    UsersUserDataResponseBodySchema,
    UsersUserDataResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler.js';
import { z } from 'zod';
import { Options } from '../index.js';

export const UsersWrapper = (
    server: string,
    sessionId: string,
    options?: Options,
) => ({
    list: async (): Promise<
        [UsersUserDataResponseBodyType[], null] | [null, string]
    > => {
        try {
            const resp = await fetch(`${server}/api/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
            });

            return handleResponse(
                z.array(UsersUserDataResponseBodySchema),
                resp,
                options,
            );
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
    getById: async (
        uid: string,
    ): Promise<[UsersUserDataResponseBodyType, null] | [null, string]> => {
        try {
            const resp = await fetch(`${server}/api/users/${uid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
            });

            return handleResponse(
                UsersUserDataResponseBodySchema,
                resp,
                options,
            );
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
