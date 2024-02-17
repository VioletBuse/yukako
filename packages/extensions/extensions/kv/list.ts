import { KvListParams, KvListResponse, KvResponse } from '@yukako/types';
import { KvBindingEnv } from './index';
import { qss } from './lib/stringify-params';

export type KvListFxn = (opts: {
    limit: number;
    cursor: number | null;
    prefix: string | null;
    suffix: string | null;
    includes: string | null;
    excludes: string | null;
}) => Promise<
    | [
          {
              list: { key: string }[];
              cursor: number | null;
          },
          null,
      ]
    | [null, string]
>;

const listInternal = async (
    params: KvListParams,
    env: KvBindingEnv,
): Promise<ReturnType<KvListFxn>> => {
    const url = `http://d.kv/__yukako/kv/${env.KV_DB_ID}/list?${qss(params)}`;
    const response = await env.__admin.fetch(url);
    const json = (await response.json()) as KvResponse<KvListResponse>;
    if (json.type === 'result') {
        return [json.result, null];
    } else {
        return [null, json.error];
    }
};

export const kvListFactory = (env: KvBindingEnv): KvListFxn => {
    return async (opts) => {
        return listInternal(
            {
                limit: opts.limit.toString(),
                cursor: opts.cursor?.toString() ?? null,
                prefix: opts.prefix,
                suffix: opts.suffix,
                includes: opts.includes,
                excludes: opts.excludes,
            },
            env,
        );
    };
};
