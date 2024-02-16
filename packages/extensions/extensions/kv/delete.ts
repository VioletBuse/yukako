import { KvBindingEnv } from './index';
import { KvDeleteParams, KvDeleteResponse, KvResponse } from '@yukako/types';
import * as qs from 'qs';
import { qss } from './lib/stringify-params';

export type kvDeleteFxn = (
    keys: string | string[],
) => Promise<[true, null] | [false, string]>;

const internalDelete = async (
    keys: string | string[],
    env: KvBindingEnv,
): Promise<[true, null] | [false, string]> => {
    const list = Array.isArray(keys) ? keys : [keys];

    const params: KvDeleteParams = {
        keys: list,
    };

    const url = `http://d.kv/__yukako/kv/${env.KV_DB_ID}?${qss(params)}`;
    const response = await env.__admin.fetch(url, { method: 'DELETE' });

    const json = (await response.json()) as KvResponse<KvDeleteResponse>;

    if (json.type === 'result') {
        return [true, null];
    } else {
        return [false, json.error];
    }
};

export const kvDeleteFactory = (env: KvBindingEnv): kvDeleteFxn => {
    return async (keys) => {
        return internalDelete(keys, env);
    };
};
