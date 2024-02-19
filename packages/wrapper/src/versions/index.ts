import { Options } from '../index.js';
import {
    ProjectVersionsDataResponseBodySchema,
    ProjectVersionsDataResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler.js';
import { z } from 'zod';

export const VersionsWrapper = (
    server: string,
    sessionId: string,
    options?: Options,
) => ({
    listRecent: async (opts?: {
        limit?: number;
        page?: number;
    }): Promise<
        [ProjectVersionsDataResponseBodyType[], null] | [null, string]
    > => {
        const limit = opts?.limit || 10;
        const page = opts?.page || 0;

        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        params.append('page', page.toString());

        try {
            const resp = await fetch(
                `${server}/api/versions?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': sessionId,
                    },
                },
            );

            return handleResponse(
                z.array(ProjectVersionsDataResponseBodySchema),
                resp,
                options,
            );
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
