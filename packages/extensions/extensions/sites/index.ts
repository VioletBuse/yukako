import mime from 'mime';

export type SiteBindingEnv = {} & Record<string, ArrayBuffer>;

export type SiteNamespace = {
    serve: (input: Request | string) => Response;
};

const makeSiteBinding = (env: SiteBindingEnv): SiteNamespace => {
    return {
        serve: (req) => {
            let path =
                typeof req === 'string' ? req : new URL(req.url).pathname;

            if (path === '/') {
                path = '/index.html';
            }

            const index = env[path];
            // console.log('typeof index', typeof index);
            // console.log('instanceof ArrayBuffer', index instanceof ArrayBuffer);

            const mimetype = mime.getType(path) || 'text/plain';

            const response = new Response(index, {
                status: 200,
                headers: {
                    'content-type': mimetype,
                },
            });

            return response;
        },
    };
};

export default makeSiteBinding;
