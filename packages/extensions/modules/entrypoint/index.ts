// @ts-ignore
import _entrypoint, { Context } from './_entrypoint.js';
import { z } from 'zod';
import { rewriteLogging } from '../../util/replaceLogging';

const validateMeta = (meta: unknown) => {
    const parse = z
        .object({
            name: z.string(),
            id: z.string(),
        })
        .safeParse(meta);

    if (!parse.success) {
        throw new Error('Invalid meta');
    }

    return parse.data;
};

export default {
    fetch: async (req: Request, env: any) => {
        try {
            const meta = validateMeta(env.__meta);
            rewriteLogging({
                name: meta.name,
                id: meta.id,
                type: 'worker',
            });

            const host =
                req.headers.get('x-forwarded-host') ||
                req.headers.get('host') ||
                'localhost:8080';
            const scheme = req.headers.get('x-forwarded-proto') || 'http';

            const baseUrl = `${scheme}://${host}`;
            const url = new URL(req.url, baseUrl);

            const pathname = url.pathname;
            const ctx: Context = {};

            if (pathname.startsWith('/__yukako/')) {
                switch (pathname) {
                    case '/__yukako/scheduled': {
                        if (!_entrypoint.scheduled) {
                            return new Response('scheduled handler undefined', {
                                status: 404,
                            });
                        }

                        try {
                            const body = await req.json();

                            const parse = z
                                .object({
                                    cron: z.string(),
                                })
                                .safeParse(body);

                            if (!parse.success) {
                                return new Response(
                                    JSON.stringify({
                                        error: 'Invalid request body for scheduled event',
                                    }),
                                    { status: 400 },
                                );
                            }

                            const event = {
                                type: 'scheduled' as const,
                                cron: parse.data.cron,
                            };

                            await _entrypoint.scheduled(event, env, ctx);

                            return new Response(
                                JSON.stringify({
                                    success: true,
                                }),
                                { status: 200 },
                            );
                        } catch (err) {
                            console.error(err);

                            let message = 'Internal server error';

                            if (err instanceof Error) {
                                message = err.message;
                            } else if (typeof err === 'string') {
                                message = err;
                            }

                            return new Response(
                                JSON.stringify({
                                    error: message,
                                }),
                                { status: 500 },
                            );
                        }
                    }
                    default: {
                        return new Response('Not found', { status: 404 });
                    }
                }
            }

            if (_entrypoint.fetch) {
                return _entrypoint.fetch(req, env, ctx);
            } else {
                return new Response('fetch handler undefined');
            }
        } catch (err) {
            if (err instanceof Error && err.message === 'Invalid meta') {
                return new Response('Invalid meta', { status: 400 });
            } else {
                console.error(err);

                let message = 'Internal server error';

                if (err instanceof Error) {
                    message = err.message;
                } else if (typeof err === 'string') {
                    message = err;
                }

                return new Response(
                    JSON.stringify({
                        error: message,
                    }),
                    { status: 500 },
                );
            }
        }
    },
};
