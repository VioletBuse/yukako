import { z } from 'zod';
import { Options } from '../index.js';

export const handleResponse = async <T extends z.ZodTypeAny>(
    schema: T,
    res: Response,
    opts?: Options,
): Promise<[z.infer<T>, null] | [null, string]> => {
    if (opts?.passthroughResult === true) {
        if (!res.ok) {
            try {
                const json = await res.json();
                if ('error' in json && typeof json.error === 'string') {
                    return [null, json.error];
                } else {
                    return [null, 'An unknown error occurred.'];
                }
            } catch (err) {
                return [
                    null,
                    'An unknown error occurred. Server did not respond with valid json.',
                ];
            }
        } else {
            try {
                const json = await res.json();
                if ('error' in json && typeof json.error === 'string') {
                    return [null, json.error];
                } else if (
                    'message' in json &&
                    typeof json.message === 'string'
                ) {
                    return [null, json.message];
                } else {
                    return [json as unknown, null];
                }
            } catch (err) {
                return [
                    null,
                    'An unknown error occurred. Server did not respond with valid json.',
                ];
            }
        }
    }

    if (!res.ok) {
        try {
            const json = await res.json();
            if ('error' in json && typeof json.error === 'string') {
                return [null, json.error];
            } else {
                return [null, 'An unknown error occurred.'];
            }
        } catch (err) {
            return [
                null,
                'An unknown error occurred. Server did not respond with valid json.',
            ];
        }
    } else {
        try {
            const json = await res.json();
            try {
                return [schema.parse(json), null];
            } catch (err) {
                if ('error' in json && typeof json.error === 'string') {
                    return [null, json.error];
                } else {
                    return [
                        null,
                        'Please verify that the server and client are on the same version.',
                    ];
                }
            }
        } catch (err) {
            return [
                null,
                'An unknown error occurred. Server did not respond with valid json.',
            ];
        }
    }
};
