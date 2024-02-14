import { KvBindingEnv } from './index';

export type kvDeleteFxn = (
    keys: string | string[],
) => Promise<[true, null] | [false, string]>;

const internalDelete = async (
    keys: string | string[],
    env: KvBindingEnv,
): Promise<[true, null] | [false, string]> => {
    const list = Array.isArray(keys) ? keys : [keys];
    const url = `http://dummy.kv/__yukako/kv/${
        env.KV_DB_ID
    }?keys=${encodeURIComponent(JSON.stringify(list))}`;
    const response = await env.__admin.fetch(url, { method: 'DELETE' });

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

export const kvDeleteFactory = (env: KvBindingEnv): kvDeleteFxn => {
    return async (keys) => {
        return internalDelete(keys, env);
    };
};
