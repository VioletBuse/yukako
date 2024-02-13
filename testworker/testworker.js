export default {
    fetch: async (req, env) => {
        // console.log('Hello from the newproject worker!');
        console.log('env', env);
        // console.log('__admin', env.__admin.fetch);

        // const res = await env.__admin.fetch('http://localhost/__yukako', {
        //     method: 'GET',
        // });
        //
        // const json = await res.text();

        // console.log('json', json);

        const kv = env.KV_BINDING;

        const getResponse = await kv.get('testkey');
        const putResponse = await kv.put('testkey-2', 'testvalue');
        const deleteResponse = await kv.delete('testkey-3');

        console.log('getResponse', getResponse);
        console.log('putResponse', putResponse);
        console.log('deleteResponse', deleteResponse);

        const getResponseWithWeirdKey = await kv.get('testk@#$#$%#\'"');
        const putResponseWithWeirdKey = await kv.put(
            'testk2@#$#$%#\'"',
            'testvalue',
        );
        const deleteResponseWithWeirdKey = await kv.delete('testk3@#$#$%#\'"');

        return new Response({
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                getResponse,
                putResponse,
                deleteResponse,
                getResponseWithWeirdKey,
                putResponseWithWeirdKey,
                deleteResponseWithWeirdKey,
            }),
        });
    },
};
