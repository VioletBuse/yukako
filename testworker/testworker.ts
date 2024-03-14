import { KvNamespace } from '@yukako/extensions/extensions/kv';
import { SiteNamespace } from '@yukako/extensions/extensions/sites';

export default {
    fetch: async (req, env) => {
        // const res = await env.__admin.fetch('http://localhost/__yukako', {
        //     method: 'GET',
        // });
        //
        // const json = await res.text();
        //
        // console.log('json', json);

        // const kv = env.KV_DATABASE as KvNamespace;
        //
        // const put1 = await kv.put('key_1', 'value_1');
        // const get1 = await kv.get('key_1');
        // const del1 = await kv.delete('key_1');
        //
        // const put2 = await kv.put('key2', 'value_2');
        // const get2 = await kv.get('key2');
        // const put3 = await kv.put({ key3: 'value_3', key4: 'value_4' });
        // const get3 = await kv.get(['key3', 'key4']);
        // const put4 = await kv.put({ key2: null, key3: 'value_30' });
        // const get4 = await kv.get(['key2', 'key3']);
        // const delete2 = await kv.delete(['key2', 'key_2', 'key3', 'key4']);
        //
        // const put5 = await kv.put({
        //     test1: 'value1',
        //     test2: 'value2',
        //     test3: 'value3',
        //     test4: 'value4',
        //     nottest: 'value5',
        //     testincludes: 'value6',
        // });
        //
        // const list1 = await kv.list({
        //     prefix: 'test',
        // });
        //
        // const list2 = await kv.list({
        //     suffix: '1',
        // });
        //
        // const list3 = await kv.list({
        //     includes: 'tinclu',
        // });
        //
        // const list4 = await kv.list({
        //     excludes: 'testin',
        // });
        //
        // const delete3 = await kv.delete([
        //     'test1',
        //     'test2',
        //     'test3',
        //     'test4',
        //     'nottest',
        //     'testincludes',
        // ]);
        //
        // const result = {
        //     test1: {
        //         put: put1,
        //         get: get1,
        //         del: del1,
        //     },
        //     test2: {
        //         put: put2,
        //         get: get2,
        //     },
        //     test3: {
        //         put: put3,
        //         get: get3,
        //     },
        //     test4: {
        //         put: put4,
        //         get: get4,
        //         del: delete2,
        //     },
        //     test5: {
        //         put: put5,
        //         list1: list1,
        //         list2: list2,
        //         list3: list3,
        //         list4: list4,
        //         del: delete3,
        //     },
        // };
        //
        // const stringifiedResult = JSON.stringify(result);
        //
        // // console.log('stringifiedResult', stringifiedResult);
        //
        // return new Response(stringifiedResult, {
        //     status: 200,
        //     headers: {
        //         'content-type': 'application/json',
        //     },
        // });

        // const site = env.SITE as SiteNamespace;

        // return site.serve(req);

        const path = env.ENVIRONMENT as string | null;

        return new Response(path, {
            status: 200,
            headers: {
                'content-type': 'text/plain',
            },
        });
    },
    scheduled: async (event) => {
        console.log(event);
        console.log('scheduled');
    },
};
