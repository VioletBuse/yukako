import { z } from 'zod';

type KvBindingEnv = {
    KV_DB_ID: string;
    __admin: {
        fetch: (
            url: string | Request,
            options?: RequestInit,
        ) => Promise<Response>;
    };
};

// type KvErrorCode =
//     | 'INVALID_SERVER_RESPONSE'
//     | 'TRANSACTION_FAILED'
//     | 'INTERNAL_SERVER_ERROR';
//
// class YukakoKvError extends Error {
//     public readonly code: KvErrorCode;
//
//     constructor(code: KvErrorCode, message: string) {
//         super(message);
//         this.code = code;
//     }
// }

export type KvNamespace = {
    get: <T extends string | string[]>(
        key: T,
    ) => Promise<
        | [T extends string ? string | null : (string | null)[], null]
        | [null, string]
    >;
    put: <T extends string | Record<string, string | null>>(
        ...args: T extends string ? [T, string | null] : [T]
    ) => Promise<[true, null] | [false, string]>;
    delete: (
        keys: string | string[],
    ) => Promise<[true, null] | [false, string]>;
    list: (opts?: {
        prefix?: string;
        includes?: string[];
        suffix?: string;
        like?: string;
        ilike?: string;
        notlike?: string;
        similarto?: string;
        notsimilarto?: string;
        cursor?: string;
        limit?: number;
    }) => Promise<
        | [
              {
                  result: [string, string][];
                  cursor: string | null;
              },
              null,
          ]
        | [null, string]
    >;
};

const parseResponse = async <T extends z.ZodTypeAny>(
    response: Response,
    schema: T,
): Promise<[z.infer<T>, null] | [null, string]> => {
    try {
        const json = await response.json();

        const parseResult = await schema.safeParseAsync(json);

        if (parseResult.success) {
            return [parseResult.data, null];
        }

        if ('error' in json && typeof json.error === 'string') {
            return [null, json.error];
        }

        if ('message' in json && typeof json.message === 'string') {
            return [null, json.message];
        }

        return [null, 'Invalid server response'];
    } catch (err) {
        return [null, 'Invalid server response'];
    }
};

const makeKvBinding = (env: KvBindingEnv): KvNamespace => {
    const namespace: KvNamespace = {
        get: async (key) => {
            if (typeof key === 'string') {
                const url = `http://yukako.kv/__yukako/kv/${
                    env.KV_DB_ID
                }?key=${encodeURIComponent(key)}`;
                const response = await env.__admin.fetch(url);

                const [parsed, error] = await parseResponse(
                    response,
                    z.object({
                        value: z.union([z.string(), z.null()]),
                    }),
                );

                if (error !== null) {
                    return [null, error];
                } else {
                    return [parsed.value, null];
                }
            } else {
                const jsonString = JSON.stringify(key);
                const url = `http://yukako.kv/__yukako/kv/${
                    env.KV_DB_ID
                }?keys=${encodeURIComponent(jsonString)}`;
                const response = await env.__admin.fetch(url);

                const [parsed, error] = await parseResponse(
                    response,
                    z.object({
                        values: z.array(z.union([z.string(), z.null()])),
                    }),
                );

                if (error !== null) {
                    return [null, error];
                } else {
                    return [parsed.values, null];
                }
            }
        },
    };

    return namespace;
};

export default makeKvBinding;
