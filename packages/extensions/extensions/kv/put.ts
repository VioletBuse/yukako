import { KvBindingEnv } from './index';
import { KvPutParams, KvPutResponse, KvResponse } from '@yukako/types';
import * as qs from 'qs';
import { qss } from './lib/stringify-params';

export type KvPutFxn = <T extends string | Record<string, string | null>>(
    ...args: T extends string ? [T, string | null] : [T]
) => Promise<[true, null] | [false, string]>;

const internalPut = async (
    list: [string, string | null][],
    env: KvBindingEnv,
): Promise<[true, null] | [false, string]> => {
    const params: KvPutParams = {
        list,
    };

    const baseUrl = `http://d.kv/__yukako/kv/${env.KV_DB_ID}?${qss(params)}`;
    const response = await env.__admin.fetch(baseUrl, { method: 'PUT' });
    const json = (await response.json()) as KvResponse<KvPutResponse>;

    if (json.type === 'result') {
        return [true, null];
    } else {
        return [false, json.error];
    }
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
