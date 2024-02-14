import { KvBindingEnv } from './index';

export type KvPutFxn = <T extends string | Record<string, string | null>>(
    ...args: T extends string ? [T, string | null] : [T]
) => Promise<[true, null] | [false, string]>;

const internalPut = async (
    list: [string, string | null][],
    env: KvBindingEnv,
): Promise<[true, null] | [false, string]> => {
    const baseUrl = `http://dummy.kv/__yukako/kv/${
        env.KV_DB_ID
    }?list=${encodeURIComponent(JSON.stringify(list))}`;
    const response = await env.__admin.fetch(baseUrl, { method: 'PUT' });
    const json = await response.json();

    if (json.success === true) {
        return [true, null];
    }

    if (typeof json.error === 'string') {
        return [false, json.error];
    }

    if (typeof json.message === 'string') {
        return [false, json.message];
    }

    return [false, 'Invalid server response'];
};

const putForDict = async <T extends Record<string, string | null>>(
    dict: T,
    env: KvBindingEnv,
): Promise<[true, null] | [false, string]> => {
    const list = Object.entries(dict);
    return internalPut(list, env);
};

const putForString = async <T extends string>(
    key: T,
    value: string | null,
    env: KvBindingEnv,
): Promise<[true, null] | [false, string]> => {
    const list = [[key, value] as [string, string | null]];
    return internalPut(list, env);
};

export const kvPutFactory = (env: KvBindingEnv): KvPutFxn => {
    return async <T extends string | Record<string, string | null>>(
        ...args: T extends string ? [T, string | null] : [T]
    ): Promise<[true, null] | [false, string]> => {
        if (typeof args[0] === 'string') {
            return putForString(args[0], args[1] as string | null, env);
        } else {
            return putForDict(args[0], env);
        }
    };
};
