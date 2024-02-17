import { kvGetFactory, KvGetFxn } from './get';
import { kvPutFactory, KvPutFxn } from './put';
import { kvDeleteFactory, kvDeleteFxn } from './delete';
import { kvListFactory, KvListFxn } from './list';

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
    list: KvListFxn;
};

const makeKvBinding = (env: KvBindingEnv): KvNamespace => {
    const namespace: KvNamespace = {
        get: kvGetFactory(env),
        put: kvPutFactory(env),
        delete: kvDeleteFactory(env),
        list: kvListFactory(env),
    };

    return namespace;
};

export default makeKvBinding;
