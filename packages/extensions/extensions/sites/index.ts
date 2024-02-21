import mime from 'mime';

export type SiteBindingEnv = {} & Record<string, ArrayBuffer>;

export type SiteNamespace = {
    serve: (
        input: Request | string,
        opts?: {
            rewriteURL?: (url: URL) => URL;
            ifNoExtensionAddHtml?: boolean;
            rewriteBasePathToIndexHtml?: boolean;
            defaultPath?: string;
        },
    ) => Response;
};

const makeSiteBinding = (env: SiteBindingEnv): SiteNamespace => {
    return {
        serve: (req, opts) => {
            let url =
                typeof req === 'string'
                    ? new URL(
                          req,
                          req.startsWith('/') ? 'https://dummy.com' : undefined,
                      )
                    : new URL(req.url);

            if (opts?.rewriteURL) {
                url = opts.rewriteURL(url);
            }

            if (
                opts?.rewriteBasePathToIndexHtml !== false &&
                url.pathname === '/'
            ) {
                url.pathname = '/index.html';
            }

            const filename = url.pathname.split('/').pop();
            const extension = filename?.split('.').pop();

            if (opts?.ifNoExtensionAddHtml && !extension) {
                url.pathname += '.html';
            }

            let file = env[url.pathname];

            if (!file) {
                if (opts?.defaultPath) {
                    file = env[opts.defaultPath];
                }

                if (!file) {
                    return new Response('Not Found', {
                        status: 404,
                    });
                }
            }

            const mimetype = mime.getType(url.pathname) || 'text/plain';

            return new Response(file, {
                status: 200,
                headers: {
                    'content-type': mimetype,
                },
            });
        },
    };
};

export default makeSiteBinding;
