export default {
    fetch: async (req: Request) => {
        console.log('Test Worker');
        return new Response('Test Worker');
    },
};
