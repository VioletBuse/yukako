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

const getProjects = async (
    kvId: string,
    db: ReturnType<typeof getDatabase>,
): Promise<KvKvDataResponseBodyType['projects']> => {
    try {
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

        return mostRecentProjectVersions
            .filter((project) => {
                if (project.projectVersions.length === 0) {
                    return false;
                }

                return project.projectVersions[0].kvDatabases.some(
                    (kv) => kv.kvDatabaseId === kvId,
                );
            })
            .map((project): KvKvDataResponseBodyType['projects'][number] => ({
                id: project.id,
                name: project.name,
                version: project.projectVersions[0].version,
            }));
    } catch (err) {
        respond.rethrow(err);

        if (err instanceof Error) {
            respond
                .status(500)
                .message(err.message ?? 'Internal Server Error')
                .throw();

            throw err;
        }
        respond.status(500).message('Internal Server Error').throw();

        throw err;
    }
};

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
                        version: project.projectVersions[0].version,
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

kvRouter.post('/:kvId', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const kvId = req.params.kvId;

        const schema = z.object({
            name: z.string().optional(),
        });

        const { name } = schema.parse(req.body);

        const result = await db.$primary.transaction(async (txn) => {
            const existing = await txn.query.kvDatabase.findFirst({
                where: eq(kvDatabase.id, kvId),
            });

            if (!existing) {
                throw new Error('Database not found');
            }

            const updated = await txn
                .update(kvDatabase)
                .set({ name })
                .where(eq(kvDatabase.id, kvId))
                .returning();

            if (!updated) {
                throw new Error('Failed to update database');
            }

            if (updated.length !== 1) {
                throw new Error('Failed to update database');
            }

            return updated[0];
        });

        const data: KvKvDataResponseBodyType = {
            id: result.id,
            name: result.name,
            created_at: result.createdAt.getTime(),
            projects: await getProjects(kvId, db),
        };

        respond.status(200).message(data).throw();
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

        const data: KvKvDataResponseBodyType = {
            id: kv.id,
            name: kv.name,
            created_at: kv.createdAt.getTime(),
            projects: await getProjects(kvId, db),
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
