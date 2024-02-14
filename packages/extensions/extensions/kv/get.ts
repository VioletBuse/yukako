import { KvBindingEnv } from './index';

type _InternalReturnType<T extends string | string[]> =
    | (T extends string
          ? [string | null, null]
          : [Record<T[number], string | null>, null])
    | [null, string];

export type KvGetFxn = <T extends string | string[]>(
    key: T,
) => Promise<_InternalReturnType<T>>;

const getInternal = async (
    list: string[],
    env: KvBindingEnv,
): Promise<_InternalReturnType<string[]>> => {
    const url = `http://dummy.kv/__yukako/kv/${
        env.KV_DB_ID
    }?keys=${encodeURIComponent(JSON.stringify(list))}`;
    const response = await env.__admin.fetch(url);

    const json = await response.json();

    try {
        if (Array.isArray(json.result)) {
            const results = list.map((k, i) => {
                if (json.result.length <= i) {
                    return [k, null];
                }

                const result = json.result[i];

                if (typeof result === 'string' || result === null) {
                    return [k, result];
                } else {
                    throw new Error('Invalid server response');
                }
            });

            return [
                Object.fromEntries(results) as Record<string, string | null>,
                null,
            ];
        }
    } catch (err) {
        return [null, 'Invalid server response'];
    }

    if (typeof json.error === 'string') {
        return [null, json.error];
    }

    if (typeof json.message === 'string') {
        return [null, json.message];
    }

    return [null, 'Invalid server response'];
};

const getForString = async <T extends string>(
    key: T,
    env: KvBindingEnv,
): Promise<_InternalReturnType<T>> => {
    const [res, err] = await getInternal([key], env);
    if (err) {
        return [null, err];
    } else if (res) {
        return [res[key], null] as _InternalReturnType<T>;
    } else {
        return [null, 'Invalid server response'];
    }
};

const getForStringArray = async <T extends string[]>(
    key: T,
    env: KvBindingEnv,
): Promise<_InternalReturnType<T>> => {
    return (await getInternal(key, env)) as _InternalReturnType<T>;
};

export const kvGetFactory = (env: KvBindingEnv): KvGetFxn => {
    return async <T extends string | string[], R = _InternalReturnType<T>>(
        key: T,
    ) => {
        if (typeof key === 'string') {
            return (await getForString(key, env)) as R;
        } else {
            return (await getForStringArray(key, env)) as R;
        }
    };
};
