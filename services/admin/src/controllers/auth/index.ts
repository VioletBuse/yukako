import { Router, Request, Response } from 'express';
import { getDatabase } from '@yukako/state/src/db/init';
import { z } from 'zod';
import { eq, or, sql } from 'drizzle-orm';
import { newUserTokens, sessions, users } from '@yukako/state/src/db/schema';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { authenticate } from '../../lib/authenticate';
import { respond } from '../../middleware/error-handling/throwable';

const authRouter = Router();

authRouter.post('/login', async (req, res) => {
    try {
        const db = getDatabase();

        const schema = z.object({
            username: z.string(),
            password: z.string(),
        });

        const parsedBody = schema.parse(req.body);

        const { username, password } = parsedBody;

        const result = await db.$primary.transaction(async (txn) => {
            const user = await txn.query.users.findFirst({
                where: eq(users.username, username),
            });

            if (!user) {
                respond
                    .status(400)
                    .message({ error: 'User does not exist' })
                    .throw();
                return;
            }

            const passwordMatches = await bcrypt.compare(
                password,
                user.passwordHash,
            );

            if (!passwordMatches) {
                // res.status(400).send({ error: 'Incorrect password' });
                respond
                    .status(400)
                    .message({ error: 'Incorrect password' })
                    .throw();
                return;
            }

            const sessionId = nanoid();

            const session = await txn
                .insert(sessions)
                .values({
                    id: sessionId,
                    userId: user.id,
                })
                .returning();

            return {
                uid: user.id,
                sessionId,
                success: true,
            };
        });

        if (result) {
            res.status(200).send(result);
        }
    } catch (e) {
        respond.rethrow(e);

        if (e instanceof z.ZodError) {
            res.status(400).send({ error: 'Invalid request body.' });
            return;
        }

        res.status(500).send({ error: 'Internal server error' });
    }
});

authRouter.post('/register', async (req, res) => {
    try {
        const db = getDatabase();

        const schema = z.object({
            username: z.string(),
            password: z.string(),
            newUserToken: z.string().nullish(),
        });

        const parsedBody = schema.parse(req.body);

        const { username, password, newUserToken } = parsedBody;

        const result = await db.$primary.transaction(async (txn) => {
            if (!newUserToken) {
                const existingUserCount = await txn.execute<{ count: number }>(
                    sql`SELECT COUNT(*) FROM ${users}`,
                );
                if (existingUserCount[0].count > 0) {
                    // res.status(400).send({
                    //     error: 'Cannot register new user without token',
                    // });
                    respond
                        .status(400)
                        .message({
                            error: 'Cannot register new user without token',
                        })
                        .throw();
                    return;
                }
            } else {
                const token = await txn.query.newUserTokens.findFirst({
                    where: eq(newUserTokens.id, newUserToken),
                });

                if (!token) {
                    // res.status(400).send({ error: 'Invalid token' });
                    respond
                        .status(400)
                        .message({ error: 'Invalid token' })
                        .throw();
                    return;
                }

                if (!token.valid) {
                    // res.status(400).send({ error: 'Token already used' });
                    respond
                        .status(400)
                        .message({ error: 'Token already used' })
                        .throw();
                    return;
                }
            }

            const existingUser = await txn.query.users.findFirst({
                where: eq(users.username, username),
            });

            if (existingUser) {
                // res.status(400).send({ error: 'User already exists' });
                respond
                    .status(400)
                    .message({ error: 'User already exists' })
                    .throw();
                return;
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const uid = nanoid();

            const user = await txn
                .insert(users)
                .values({
                    id: uid,
                    username,
                    passwordHash,
                })
                .returning();

            const sessionId = nanoid();

            const session = await txn
                .insert(sessions)
                .values({
                    id: sessionId,
                    userId: uid,
                })
                .returning();

            if (newUserToken) {
                await txn
                    .update(newUserTokens)
                    .set({
                        valid: false,
                        newUserId: uid,
                    })
                    .where(eq(newUserTokens.id, newUserToken));
            }

            return {
                uid,
                sessionId,
                success: true,
            };
        });

        if (result) {
            res.status(200).send(result);
        }
    } catch (e) {
        respond.rethrow(e);

        if (e instanceof z.ZodError) {
            res.status(400).send({ error: 'Invalid request body.' });
            return;
        }

        res.status(500).send({ error: 'Internal server error' });
    }
});

authRouter.post('/new-user-token', async (req: Request, res: Response) => {
    try {
        const db = getDatabase();

        const user = await authenticate(req);

        const result = await db.$primary.transaction(async (txn) => {
            const token = nanoid();

            await txn
                .insert(newUserTokens)
                .values({
                    id: token,
                    valid: true,
                    createdById: user.uid,
                })
                .returning();

            return {
                token,
                success: true,
            };
        });

        if (result) {
            respond.status(200).message(result).throw();
        }
    } catch (e) {
        respond.rethrow(e);

        if (e instanceof z.ZodError) {
            res.status(400).send({ error: 'Invalid request body.' });
            return;
        }

        res.status(500).send({ error: 'Internal server error' });
    }
});

authRouter.get('/me', async (req: Request, res: Response) => {
    try {
        const user = await authenticate(req);

        res.status(200).send(user);
    } catch (e) {
        respond.rethrow(e);

        if (e instanceof z.ZodError) {
            res.status(400).send({ error: 'Invalid request body.' });
            return;
        }

        res.status(500).send({ error: 'Internal server error' });
    }
});

export default authRouter;
