import { KvNamespace } from '@yukako/extensions/extensions/kv';

export default {
    fetch: async (req, env) => {
        // console.log('Hello from the newproject worker!');
        // console.log('env', env);
        // console.log('__admin', env.__admin.fetch);

        // const res = await env.__admin.fetch('http://localhost/__yukako', {
        //     method: 'GET',
        // });
        //
        // const json = await res.text();

        // console.log('json', json);

        const kv = env.KV_DATABASE as KvNamespace;

        const put1 = await kv.put('key_1', 'value_1');
        const get1 = await kv.get('key_1');
        const del1 = await kv.delete('key_1');

        const put2 = await kv.put('key_2', 'value_2');
        const get2 = await kv.get('key_2');
        const put3 = await kv.put({ key3: 'value_3', key4: 'value_4' });
        const get3 = await kv.get(['key3', 'key4']);
        const put4 = await kv.put({ key2: null, key3: 'value_30' });
        const get4 = await kv.get(['key2', 'key3']);
        const delete2 = await kv.delete(['key2', 'key3', 'key4']);

        const result = {
            test1: {
                put: put1,
                get: get1,
                del: del1,
            },
            test2: {
                put: put2,
                get: get2,
            },
            test3: {
                put: put3,
                get: get3,
            },
            test4: {
                put: put4,
                get: get4,
                del: delete2,
            },
        };

        const stringifiedResult = JSON.stringify(result);

        // console.log('stringifiedResult', stringifiedResult);

        return new Response(stringifiedResult, {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        });
    },
};
