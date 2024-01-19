export default {
    fetch: (req, env) => {
        console.log('Hello from the newproject worker!');
        // console.log('env', env);

        return new Response('Hello World from newproject!', {
            status: 200,
        });
    },
};
