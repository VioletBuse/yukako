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

        const kv = env.KV_BINDING;

        const getTest1 = await kv.get('test1');
        const getTest2 = await kv.get('test$%&%^&^&');
        const getTest3 = await kv.get(['test1', 'test2', 'test2']);
        const getTest4 = await kv.get([
            'test{"L"DE@#$',
            'test%$&%^$$SD',
            'te$%$',
        ]);

        const putTest1 = await kv.put('test1', 'test1');
        const putTest2 = await kv.put('t#$%^$%^&', 'test2');
        const putTest3 = await kv.put({ key1: 'val1', key2: 'val2' });
        const putTest4 = await kv.put({ '$%^$%#$^#': 'val3' });

        const deleteTest1 = await kv.delete('test1');
        const deleteTest2 = await kv.delete('t#$%^$%^&');
        const deleteTest3 = await kv.delete(['key1', 'key2']);
        const deleteTest4 = await kv.delete(['$%^$%#$^#']);

        const result = {
            get: {
                getTest1,
                getTest2,
                getTest3,
                getTest4,
            },
            put: {
                putTest1,
                putTest2,
                putTest3,
                putTest4,
            },
            delete: {
                deleteTest1,
                deleteTest2,
                deleteTest3,
                deleteTest4,
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
