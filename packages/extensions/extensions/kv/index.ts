type KvBindingEnv = {
    KV_DB_ID: string;
    __admin: {
        fetch: (
            url: string | Request,
            options?: RequestInit,
        ) => Promise<Response>;
    };
};

export type KvNamespace = {
    get: (key: string) => Promise<[string | null, null] | [null, string]>;
    put: (
        key: string,
        value: string,
    ) => Promise<[true, null] | [false, string]>;
    delete: (key: string) => Promise<[true, null] | [false, string]>;
};

const makeKvBinding = (env: KvBindingEnv): KvNamespace => {
    return {
        get: async (key: string) => {
            try {
                const response = await env.__admin.fetch(
                    `http://dummy.com/__yukako/kv/${
                        env.KV_DB_ID
                    }/${encodeURIComponent(key)}`,
                );

                const json = await response.json();

                if (!response.ok) {
                    if (response.status === 404) {
                        return [null, null];
                    } else {
                        if ('error' in json && typeof json.error === 'string') {
                            return [null, json.error];
                        } else if (
                            'message' in json &&
                            typeof json.message === 'string'
                        ) {
                            return [null, json.message];
                        } else {
                            return [null, 'Internal server error'];
                        }
                    }
                } else {
                    if (typeof json.value === 'string') {
                        return [json.value, null];
                    } else {
                        return [
                            null,
                            'Internal server error, value is not a string',
                        ];
                    }
                }
            } catch (err) {
                if (err instanceof Error) {
                    return [null, err.message];
                } else if (typeof err === 'string') {
                    return [null, err];
                } else {
                    return [null, 'Unknown error'];
                }
            }
        },
        put: async (key: string, value: string) => {
            try {
                const response = await env.__admin.fetch(
                    `http://dummy.com/__yukako/kv/${
                        env.KV_DB_ID
                    }/${encodeURIComponent(key)}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ value }),
                    },
                );
                const json = await response.json();
                if (!response.ok) {
                    if ('error' in json && typeof json.error === 'string') {
                        return [false, json.error];
                    } else if (
                        'message' in json &&
                        typeof json.message === 'string'
                    ) {
                        return [false, json.message];
                    } else {
                        return [false, 'Internal server error'];
                    }
                } else {
                    return [true, null];
                }
            } catch (err) {
                if (err instanceof Error) {
                    return [false, err.message];
                } else if (typeof err === 'string') {
                    return [false, err];
                } else {
                    return [false, 'Unknown error'];
                }
            }
        },
        delete: async (key: string) => {
            try {
                const response = await env.__admin.fetch(
                    `http://dummy.com/__yukako/kv/${
                        env.KV_DB_ID
                    }/${encodeURIComponent(key)}`,
                    {
                        method: 'DELETE',
                    },
                );
                const json = await response.json();
                if (!response.ok) {
                    if ('error' in json && typeof json.error === 'string') {
                        return [false, json.error];
                    } else if (
                        'message' in json &&
                        typeof json.message === 'string'
                    ) {
                        return [false, json.message];
                    } else {
                        return [false, 'Internal server error'];
                    }
                } else {
                    return [true, null];
                }
            } catch (err) {
                if (err instanceof Error) {
                    return [false, err.message];
                } else if (typeof err === 'string') {
                    return [false, err];
                } else {
                    return [false, 'Unknown error'];
                }
            }
        },
    };
};

export default makeKvBinding;
