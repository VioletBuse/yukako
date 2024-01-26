import { z } from 'zod';

export const handleResponse = async <T extends z.ZodTypeAny>(
    schema: T,
    res: Response,
): Promise<[z.infer<T>, null] | [null, string]> => {
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
