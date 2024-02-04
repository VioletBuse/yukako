import {
    UsersUserDataResponseBodySchema,
    UsersUserDataResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler';
import { z } from 'zod';

export const UsersWrapper = (server: string, sessionId: string) => ({
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
            );
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
