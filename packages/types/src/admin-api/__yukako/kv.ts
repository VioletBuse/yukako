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
