import { Request, Response } from 'express';
import { z } from 'zod';
import { getDatabase } from '@yukako/state';
import { eq } from 'drizzle-orm';
import { sessions, users } from '@yukako/state/src/db/schema';
import { respond } from '../middleware/error-handling/throwable';

export const authenticate = async (
    req: Request,
): Promise<{
    uid: string;
    username: string;
    sessionId: string;
}> => {
    try {
        const cookieSessionId = req.cookies['session-id'] as
            | string
            | undefined
            | null;
        const authorizationHeader = req.headers['authorization'];
        const bearerToken = authorizationHeader?.split(' ')[1];
        const XauthTokenHeader = req.headers['x-auth-token'] as
            | string
            | undefined
            | null;
        const authTokenHeader = req.headers['auth-token'] as
            | string
            | undefined
            | null;

        const sessionId =
            cookieSessionId ||
            bearerToken ||
            XauthTokenHeader ||
            authTokenHeader;

        // console.log(`sessionId: ${sessionId}`);

        if (typeof sessionId !== 'string') {
            // res.status(400).send({ error: 'Invalid session ID' });
            respond
                .status(400)
                .message({ error: 'Invalid login session ID' })
                .throw();

            // console.log('post throw');
        }

        const db = getDatabase();

        const userQuery = await db
            .select({ uid: users.id, username: users.username })
            .from(users)
            .where(
                eq(
                    users.id,
                    db
                        .select({ id: sessions.userId })
                        .from(sessions)
                        .where(eq(sessions.id, sessionId ?? '')),
                ),
            )
            .execute();

        if (userQuery.length === 0) {
            // res.status(400).send({ error: 'Invalid session ID' });
            respond
                .status(400)
                .message({ error: 'Invalid login session ID' })
                .throw();
            throw new Error('Invalid login session ID');
        }

        const user = userQuery[0];

        return {
            ...user,
            sessionId: sessionId ?? '',
        };
    } catch (e) {
        respond.rethrow(e);

        respond.status(500).message({ error: 'Internal server error' }).throw();

        throw e;
    }
};
