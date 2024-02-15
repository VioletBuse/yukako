import { z } from 'zod';
import { useEffect, useState } from 'react';

// type ValidatedResponse<T extends z.ZodTypeAny> = { mutate: () => void } & (
//     | {
//           data: z.infer<T>;
//           error: null;
//           loading: false;
//       }
//     | {
//           data: null;
//           error: string;
//           loading: false;
//       }
//     | {
//           data: null;
//           error: null;
//           loading: true;
//       }
// );

// same as above but as an array to destructure instead of an object, with the same type checking
type ValidatedResponse<T extends z.ZodTypeAny> =
    | [z.infer<T>, null, false, () => void]
    | [null, string, false, () => void]
    | [null, null, true, () => void];

type res = {
    isLoading: boolean | undefined;
    data: unknown;
    error: unknown;
    mutate: () => void;
};

export const useValidateSWRResponse = <T extends z.ZodTypeAny>(
    schema: T,
    res: res,
): ValidatedResponse<T> => {
    const [response, setResponse] = useState<ValidatedResponse<T>>([
        null,
        null,
        true,
        res.mutate,
    ]);

    const processRes = (res: res): ValidatedResponse<T> => {
        const { data, error, mutate } = res;

        if (error) {
            let message = 'An unknown error occurred.';

            if (typeof error === 'string') {
                message = error;
            } else if (error instanceof Error) {
                message = error.message;
            }

            return [null, message, false, mutate];
        } else if (data !== undefined) {
            const dataSchema = z.union([
                z.tuple([schema, z.null()]),
                z.tuple([z.null(), z.string()]),
            ]);

            const parseResult = dataSchema.safeParse(data);

            console.log('success', parseResult.success);
            console.log('parseResult', parseResult);

            if (!parseResult.success) {
                let message = 'An unknown error occurred.';

                if (Array.isArray(data) && data.length >= 2) {
                    const [, err] = data;

                    if (typeof err === 'string') {
                        message = err;
                    } else if (err instanceof Error) {
                        message = err.message;
                    }
                }

                if (typeof data === 'string') {
                    message = data;
                }

                if (typeof data === 'object' && data !== null) {
                    if ('err' in data && typeof data.err === 'string') {
                        message = data.err;
                    } else if (
                        'error' in data &&
                        typeof data.error === 'string'
                    ) {
                        message = data.error;
                    } else if (
                        'message' in data &&
                        typeof data.message === 'string'
                    ) {
                        message = data.message;
                    }
                }

                return [null, message, false, mutate];
            } else {
                const [res, err] = parseResult.data;

                if (err) {
                    return [null, err, false, mutate];
                } else if (res) {
                    return [res, null, false, mutate];
                } else {
                    return [null, 'An unknown error occurred.', false, mutate];
                }
            }
        } else {
            return [null, null, true, mutate];
        }
    };

    useEffect(() => {
        const validResponse = processRes(res);
        setResponse(validResponse);
    }, [res.data, res.error, res.isLoading, res.mutate]);

    return response;
};
