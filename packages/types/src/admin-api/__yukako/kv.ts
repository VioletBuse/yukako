export type KvResponse<T> =
    | {
          type: 'result';
          result: T;
      }
    | {
          type: 'error';
          error: string;
      };

export type KvGetParams = {
    keys: string[];
};

export type KvGetResponse = {
    values: Record<string, string | null>;
};

export type KvListParams = {
    limit: string;
    cursor: string | null;
    prefix: string | null;
    suffix: string | null;
    includes: string | null;
    excludes: string | null;
};

export type KvListResponse = {
    list: { key: string }[];
    cursor: number | null;
};

export type KvPutParams = {
    list: [string, string | null][];
};

export type KvPutResponse = {
    success: boolean;
};

export type KvDeleteParams = {
    keys: string[];
};

export type KvDeleteResponse = {
    success: boolean;
};
