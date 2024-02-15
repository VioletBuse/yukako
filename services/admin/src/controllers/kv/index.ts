import { Router } from 'express';
import { respond } from '../../middleware/error-handling/throwable';
import { getDatabase } from '@yukako/state';
import { authenticate } from '../../lib/authenticate';
import { z, ZodError } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { kvDatabase, projectVersions } from '@yukako/state/src/db/schema';
import { nanoid } from 'nanoid';
import { KvKvDataResponseBodyType } from '@yukako/types';

const kvRouter = Router();

kvRouter.post('/', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const schema = z.object({
            name: z.string(),
        });

        const { name } = schema.parse(req.body);

        const res = await db.$primary.transaction(async (txn) => {
            const existing = await txn.query.kvDatabase.findMany({
                where: eq(kvDatabase.name, name),
            });

            if (existing.length > 0) {
                throw new Error('Database with that name already exists');
            }

            const newDb = await txn
                .insert(kvDatabase)
                .values({ id: nanoid(), name })
                .returning();

            if (!newDb) {
                throw new Error('Failed to create database');
            }

            if (newDb.length !== 1) {
                throw new Error('Failed to create database');
            }

            return newDb[0];
        });

        const data: KvKvDataResponseBodyType = {
            id: res.id,
            name: res.name,
            created_at: res.createdAt.getTime(),
            projects: [],
        };

        respond.status(201).message(data).throw();
    } catch (err) {
        respond.rethrow(err);

        if (err instanceof ZodError) {
            respond.status(400).message('Malformed Request Body').throw();
            return;
        }

        if (err instanceof Error) {
            respond
                .status(500)
                .message(err.message ?? 'Internal Server Error')
                .throw();
            return;
        }

        respond.status(500).message('Internal Server Error').throw();
    }
});

kvRouter.get('/', async (req) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const dbs = await db.query.kvDatabase.findMany();

        const mostRecentProjectVersions = await db.query.projects.findMany({
            with: {
                projectVersions: {
                    orderBy: desc(projectVersions.version),
                    limit: 1,
                    with: {
                        kvDatabases: true,
                    },
                },
            },
        });

        const data: KvKvDataResponseBodyType[] = dbs.map(
            (db): KvKvDataResponseBodyType => {
                const projects = mostRecentProjectVersions
                    .filter((project) => {
                        if (project.projectVersions.length === 0) {
                            return false;
                        }

                        return project.projectVersions[0].kvDatabases.some(
                            (kv) => kv.kvDatabaseId === db.id,
                        );
                    })
                    .map((project) => ({
                        id: project.id,
                        name: project.name,
                    }));

                return {
                    id: db.id,
                    name: db.name,
                    created_at: db.createdAt.getTime(),
                    projects,
                };
            },
        );

        respond.status(200).message(data).throw();
    } catch (err) {
        respond.rethrow(err);

        if (err instanceof Error) {
            respond
                .status(500)
                .message(err.message ?? 'Internal Server Error')
                .throw();
            return;
        }
        respond.status(500).message('Internal Server Error').throw();
    }
});

kvRouter.get('/:kvId', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const kvId = req.params.kvId;

        const kv = await db.query.kvDatabase.findFirst({
            where: eq(kvDatabase.id, kvId),
        });

        if (!kv) {
            respond.status(404).message('Database not found').throw();
            return;
        }

        const mostRecentProjectVersions = await db.query.projects.findMany({
            with: {
                projectVersions: {
                    orderBy: desc(projectVersions.version),
                    limit: 1,
                    with: {
                        kvDatabases: {
                            where: eq(kvDatabase.id, kvId),
                        },
                    },
                },
            },
        });

        const projects = mostRecentProjectVersions
            .filter((project) => {
                if (project.projectVersions.length === 0) {
                    return false;
                }

                return project.projectVersions[0].kvDatabases.some(
                    (kv) => kv.kvDatabaseId === kvId,
                );
            })
            .map((project) => ({
                id: project.id,
                name: project.name,
            }));

        const data: KvKvDataResponseBodyType = {
            id: kv.id,
            name: kv.name,
            created_at: kv.createdAt.getTime(),
            projects,
        };

        respond.status(200).message(data).throw();
    } catch (err) {
        respond.rethrow(err);
        if (err instanceof Error) {
            respond
                .status(500)
                .message(err.message ?? 'Internal Server Error')
                .throw();
            return;
        }
        respond.status(500).message('Internal Server Error').throw();
    }
});

export default kvRouter;
