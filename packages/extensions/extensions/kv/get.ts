import { KvBindingEnv } from './index';
import { KvGetParams, KvGetResponse, KvResponse } from '@yukako/types';
import * as qs from 'qs';
import { qss } from './lib/stringify-params';

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
    const params: KvGetParams = {
        keys: list,
    };

    const url = `http://d.kv/__yukako/kv/${env.KV_DB_ID}?${qss(params)}`;
    const response = await env.__admin.fetch(url);

    const json = (await response.json()) as KvResponse<KvGetResponse>;

    // console.log('json', json);

    if (json.type === 'result') {
        return [json.result.values, null];
    } else {
        return [null, json.error];
    }
};

const getForString = async <T extends string>(
    key: T,
    env: KvBindingEnv,
): Promise<_InternalReturnType<T>> => {
    const [res, err] = await getInternal([key], env);
    if (err !== null) {
        return [null, err];
    } else if (res !== null) {
        return [res[key] ?? null, null] as _InternalReturnType<T>;
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
