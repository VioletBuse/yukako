export default {
    fetch: async (req, env) => {
        // console.log('Hello from the newproject worker!');
        // console.log('env', env);
        // console.log('__admin', env.__admin.fetch);

        const res = await env.__admin.fetch('http://dummy/', {
            method: 'GET',
        });

        const json = await res.text();

        console.log('json', json);

        return new Response(json);
    },
};
