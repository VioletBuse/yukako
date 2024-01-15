export default {
    fetch: () => {
        console.log('Hello from the test worker!');
        return new Response('Hello World from newproject!', {
            status: 200,
        });
    },
};
