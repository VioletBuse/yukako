import { kvGetFactory, KvGetFxn } from './get';
import { kvPutFactory, KvPutFxn } from './put';
import { kvDeleteFactory, kvDeleteFxn } from './delete';

export type KvBindingEnv = {
    KV_DB_ID: string;
    __admin: {
        fetch: (
            url: string | Request,
            options?: RequestInit,
        ) => Promise<Response>;
    };
};

export type KvNamespace = {
    get: KvGetFxn;
    put: KvPutFxn;
    delete: kvDeleteFxn;
};

const makeKvBinding = (env: KvBindingEnv): KvNamespace => {
    const namespace: KvNamespace = {
        get: kvGetFactory(env),
        put: kvPutFactory(env),
        delete: kvDeleteFactory(env),
    };

    return namespace;
};

export default makeKvBinding;
