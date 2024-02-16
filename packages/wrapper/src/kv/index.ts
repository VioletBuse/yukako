import { Options } from '../index';
import {
    KvKvDataResponseBodySchema,
    KvKvDataResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler';
import { z } from 'zod';

export const KvWrapper = (
    server: string,
    sessionId: string,
    opts?: Options,
) => ({
    create: async (
        name: string,
    ): Promise<[KvKvDataResponseBodyType, null] | [null, string]> => {
        try {
            const resp = await fetch(`${server}/api/kv`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
                body: JSON.stringify({ name }),
            });

            return handleResponse(KvKvDataResponseBodySchema, resp, opts);
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
    list: async (): Promise<
        [KvKvDataResponseBodyType[], null] | [null, string]
    > => {
        try {
            const resp = await fetch(`${server}/api/kv`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
            });

            return handleResponse(
                z.array(KvKvDataResponseBodySchema),
                resp,
                opts,
            );
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
    getById: async (
        id: string,
    ): Promise<[KvKvDataResponseBodyType, null] | [null, string]> => {
        try {
            const resp = await fetch(`${server}/api/kv/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
            });

            return handleResponse(KvKvDataResponseBodySchema, resp, opts);
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
    updateOne: async (
        id: string,
        data: {
            name?: string;
        },
    ): Promise<[KvKvDataResponseBodyType, null] | [null, string]> => {
        try {
            const resp = await fetch(`${server}/api/kv/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
                body: JSON.stringify(data),
            });

            return handleResponse(KvKvDataResponseBodySchema, resp, opts);
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
