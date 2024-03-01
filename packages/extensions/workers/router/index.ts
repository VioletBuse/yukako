import { rewriteLogging } from '../../util/replaceLogging';

type ServiceBinding = {
    fetch: (req: Request) => Promise<Response>;
};

export type RouterEnv = {
    __meta: {
        id: string;
        routes: {
            host: string;
            paths: string[];
            service: string;
            worker_name: string;
        }[];
    };
} & Record<string, ServiceBinding | undefined>;

export default {
    fetch: async (req: Request, env: RouterEnv) => {
        rewriteLogging({
            id: env.__meta.id,
            type: 'router',
            name: 'yukako-router',
        });

        const workername = req.headers.get('x-forwarded-to-worker');

        const host =
            req.headers.get('x-forwarded-host') ||
            req.headers.get('host') ||
            '';
        const url = new URL(req.url);

        console.log(
            `[router] ${req.method} ${host} ${url.pathname}${url.search}`,
        );

        if (!host) {
            return new Response('No x-forwarded-host header', { status: 400 });
        }

        const routesMatchingHost = Object.values(env.__meta.routes).filter(
            (route) => {
                return (
                    route.host === host ||
                    route.host === '*' ||
                    route.worker_name === workername
                );
            },
        );

        if (routesMatchingHost.length === 0) {
            return new Response('No service matching host', { status: 404 });
        }

        const routesMatchingPath = routesMatchingHost.filter((route) => {
            if (!route.paths || route.paths.length === 0) {
                return true;
            }

            const url = new URL(req.url);

            if (url.pathname.startsWith('/__yukako')) {
                return true;
            }

            for (const path of route.paths) {
                if (url.pathname.startsWith(path)) {
                    return true;
                }
            }
        });

        if (routesMatchingPath.length === 0) {
            return new Response('No service matching path', { status: 404 });
        }

        const route = routesMatchingPath[0];
        const service = env[route.service];

        if (!service || !service.fetch) {
            return new Response('No service found', { status: 404 });
        }

        return service.fetch(req);
    },
};
