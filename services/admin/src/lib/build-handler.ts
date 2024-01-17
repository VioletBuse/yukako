import { z } from 'zod';
import type { Request, Response } from 'express';
import { respond } from '../middleware/error-handling/throwable';
import { authenticate } from './authenticate';

type CustomRequest<Body, Query, Cookie, Header, Params, Auth> = {
    body: Body;
    query: Query;
    cookie: Cookie;
    header: Header;
    params: Params;
    auth: Auth extends true
        ? { uid: string; username: string; sessionId: string }
        : undefined;
    pathname: string;
};

export const buildRequestHandler = <
    ResponseType extends any,
    ZodBodySchema extends z.ZodType<unknown> = z.ZodType<unknown>,
    ZodQuerySchema extends z.ZodType<Record<string, any>> = z.ZodType<
        Record<string, any>
    >,
    ZodCookieSchema extends z.ZodType<Record<string, any>> = z.ZodType<
        Record<string, any>
    >,
    ZodHeaderSchema extends z.ZodType<Record<string, any>> = z.ZodType<
        Record<string, any>
    >,
    ZodParamsSchema extends z.ZodType<Record<string, any>> = z.ZodType<
        Record<string, any>
    >,
    RequireAuth extends boolean = false,
>(opts: {
    bodySchema?: ZodBodySchema;
    requireAuth?: RequireAuth;
    querySchema?: ZodQuerySchema;
    cookieSchema?: ZodCookieSchema;
    headerSchema?: ZodHeaderSchema;
    paramsSchema?: ZodParamsSchema;
    handler: (
        req: CustomRequest<
            z.infer<ZodBodySchema>,
            z.infer<ZodQuerySchema>,
            z.infer<ZodCookieSchema>,
            z.infer<ZodHeaderSchema>,
            z.infer<ZodParamsSchema>,
            RequireAuth
        >,
        res: respond<ResponseType>,
    ) => Promise<void>;
}) => {
    const parseIssues = (issues: z.ZodIssue[]) => {
        const messages = issues.map((issue) => {
            const path = issue.path
                .map((pathItem) => {
                    if (typeof pathItem === 'string') {
                        return `.${pathItem}`;
                    } else {
                        return `[${pathItem}]`;
                    }
                })
                .join('')
                .slice(1);

            return `Error at ${path}: ${issue.message}`;
        });

        const finalMessage = messages.join('\n');
    };

    return async (req: Request, res: Response) => {
        const throwable = respond.new<ResponseType>();

        let auth:
            | { uid: string; username: string; sessionId: string }
            | undefined = undefined;

        if (opts.requireAuth) {
            const _auth = await authenticate(req);

            if (!_auth) {
                throwable.status(401).message('Unauthorized').throw();
                return;
            }

            auth = _auth;
        }

        const bodySchema = opts.bodySchema ?? z.record(z.any());

        const parsedBody = bodySchema.safeParse(req.body);

        if (!parsedBody.success) {
            throwable
                .status(400)
                .message(
                    'Invalid Request Body: ' +
                        parseIssues(parsedBody.error.issues),
                )
                .throw();
            return;
        }

        const body = parsedBody.data;

        const querySchema = opts.querySchema ?? z.record(z.any());

        const parsedQuery = querySchema.safeParse(req.query);

        if (!parsedQuery.success) {
            throwable
                .status(400)
                .message(
                    'Invalid Request Query: ' +
                        parseIssues(parsedQuery.error.issues),
                )
                .throw();
            return;
        }

        const query = parsedQuery.data;

        const cookieSchema = opts.cookieSchema ?? z.record(z.any());

        const parsedCookie = cookieSchema.safeParse(req.cookies);

        if (!parsedCookie.success) {
            throwable
                .status(400)
                .message(
                    'Invalid Request Cookies: ' +
                        parseIssues(parsedCookie.error.issues),
                )
                .throw();
            return;
        }

        const cookie = parsedCookie.data;

        const headerSchema = opts.headerSchema ?? z.record(z.any());

        const parsedHeader = headerSchema.safeParse(req.headers);

        if (!parsedHeader.success) {
            throwable
                .status(400)
                .message(
                    'Invalid Request Headers: ' +
                        parseIssues(parsedHeader.error.issues),
                )
                .throw();
            return;
        }

        const header = parsedHeader.data;

        const paramsSchema = opts.paramsSchema ?? z.record(z.any());

        const parsedParams = paramsSchema.safeParse(req.params);

        if (!parsedParams.success) {
            throwable
                .status(400)
                .message(
                    'Invalid Request Params: ' +
                        parseIssues(parsedParams.error.issues),
                )
                .throw();
            return;
        }

        const params = parsedParams.data;

        const request: CustomRequest<
            z.infer<ZodBodySchema>,
            z.infer<ZodQuerySchema>,
            z.infer<ZodCookieSchema>,
            z.infer<ZodHeaderSchema>,
            z.infer<ZodParamsSchema>,
            RequireAuth
        > = {
            body,
            query,
            cookie,
            header,
            params,
            // @ts-ignore
            auth,
            pathname: req.path,
        };

        const response = respond.new<ResponseType>(res);

        try {
            await opts.handler(request, response);
        } catch (e) {
            console.error(e);

            respond.rethrow(e);

            if (e instanceof z.ZodError) {
                throwable
                    .status(400)
                    .message('Invalid Request Body: ' + parseIssues(e.issues))
                    .throw();
                return;
            }

            throwable.status(500).message('Internal Server Error').throw();
            return;
        }
    };
};
