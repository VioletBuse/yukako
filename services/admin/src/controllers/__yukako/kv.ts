import { NextFunction, Request, Response, Router } from 'express';
import {
    handleThrownError,
    respond,
} from '../../middleware/error-handling/throwable';
import {
    KvDeleteResponse,
    KvGetParams,
    KvGetResponse,
    KvResponse,
    KvPutResponse,
    KvPutParams,
    KvDeleteParams,
} from '@yukako/types';
import { parseParams } from '../../lib/parse-params';
import { getDatabase } from '@yukako/state';
import { kvEntry } from '@yukako/state/src/db/schema';
import { and, eq } from 'drizzle-orm';
import { inArray } from 'drizzle-orm/sql/expressions/conditions';

const internalKvRouter = Router();

internalKvRouter.get('/:kvId', async (req, res) => {
    try {
        const kvid = req.params.kvId;
        const params = parseParams<KvGetParams>(req);

        const db = getDatabase();

        const keys = params.keys;

        const entries = await db
            .select({
                key: kvEntry.key,
                value: kvEntry.value,
            })
            .from(kvEntry)
            .where(
                and(eq(kvEntry.kvDatabaseId, kvid), inArray(kvEntry.key, keys)),
            );

        console.log(entries);

        const result: KvResponse<KvGetResponse> = {
            type: 'result',
            result: {
                values: Object.fromEntries(
                    keys.map((key) => [
                        key,
                        entries.find((entry) => entry.key === key)?.value ??
                            null,
                    ]),
                ),
            },
        };

        console.log('result', result);

        respond.status(200).message(result).throw();
    } catch (err) {
        respond.rethrow(err);

        let message = 'Internal Server Error';

        if (err instanceof Error) {
            message = err.message;
        } else if (typeof err === 'string') {
            message = err;
        }

        respond.status(500).message({ type: 'error', error: message }).throw();
    }
});

internalKvRouter.put('/:kvId', (req, res) => {
    const kvid = req.params.kvId;
    const params = parseParams<KvPutParams>(req);

    // console.log('kvRouter.put /:kvId', kvid, Object.fromEntries(params.list));

    const result: KvResponse<KvPutResponse> = {
        type: 'result',
        result: {
            success: true,
        },
    };

    respond.status(200).message(result).throw();
});

internalKvRouter.delete('/:kvId', (req, res) => {
    const kvid = req.params.kvId;
    const params = parseParams<KvDeleteParams>(req);

    // console.log('kvRouter.delete /:kvId', kvid, params.keys);

    const result: KvResponse<KvDeleteResponse> = {
        type: 'result',
        result: {
            success: true,
        },
    };

    respond.status(200).message(result).throw();
});

internalKvRouter.use(handleThrownError);
internalKvRouter.use(
    (err: unknown, req: Request, res: Response, next: NextFunction) => {
        let message = 'Internal Server Error';

        if (err instanceof Error) {
            message = err.message;
        } else if (typeof err === 'string') {
            message = err;
        }

        res.status(500).send({ type: 'error', error: message });
    },
);

export default internalKvRouter;
