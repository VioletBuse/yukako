import { Router } from 'express';
import { getDatabase } from '@yukako/state';
import { respond } from '../../middleware/error-handling/throwable';
import { z, ZodError } from 'zod';
import { nanoid } from 'nanoid';
import {
    dataBlobs,
    projects,
    projectVersionBlobs,
    projectVersionRoutes,
    projectVersions,
} from '@yukako/state/src/db/schema';
import { desc, eq } from 'drizzle-orm';
import { authenticate } from '../../lib/authenticate';
import { getSql } from '@yukako/state/src/db/init';
import versionsRouter from './versions';
import type { ProjectType } from '@yukako/types';

const projectsRouter = Router();

projectsRouter.use('/:projectId/versions', versionsRouter);

projectsRouter.post('/', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const schema = z.object({
            name: z.string(),
        });

        const data = schema.parse(req.body);

        const result = await db.$primary.transaction(async (txn) => {
            const existingProject = await txn.query.projects.findFirst({
                where: eq(projects.name, data.name),
            });

            if (existingProject) {
                respond
                    .status(400)
                    .message({ error: 'Project already exists' })
                    .throw();
                return;
            }

            const project = await txn
                .insert(projects)
                .values({
                    id: nanoid(),
                    name: data.name,
                })
                .returning()
                .execute();

            if (!project) {
                respond
                    .status(500)
                    .message({ error: 'Internal server error' })
                    .throw();
                return;
            }

            return {
                success: true,
                id: project[0].id,
                name: project[0].name,
            };
        });

        if (result) {
            respond.status(200).message(result).throw();
            return;
        }
    } catch (e) {
        respond.rethrow(e);

        if (e instanceof ZodError) {
            respond
                .status(400)
                .message({ error: 'Invalid request body.' })
                .throw();
            return;
        }

        respond.status(500).message({ error: 'Internal server error' }).throw();
    }
});

projectsRouter.get('/', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const projectsData = await db.query.projects.findMany({
            with: {
                projectVersions: {
                    orderBy: desc(projectVersions.version),
                    limit: 1,
                },
            },
        });

        const projects = projectsData.map((project) => ({
            id: project.id,
            name: project.name,
            latest_version: project.projectVersions[0]
                ? project.projectVersions[0].version
                : null,
        }));

        respond.status(200).message(projects).throw();
    } catch (e) {
        console.error(e);
        respond.rethrow(e);

        respond.status(500).message({ error: 'Internal server error' }).throw();
    }
});

projectsRouter.get('/:projectId', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const projectData = await db.query.projects.findFirst({
            where: eq(projects.id, req.params.projectId),
            with: {
                projectVersions: {
                    orderBy: desc(projectVersions.version),
                    limit: 1,
                },
            },
        });

        if (!projectData) {
            respond.status(404).message({ error: 'Project not found' }).throw();
            return;
        }

        const project = {
            id: projectData.id,
            name: projectData.name,
            latest_version: projectData.projectVersions[0]
                ? projectData.projectVersions[0].version
                : null,
        };

        respond.status(200).message(project).throw();
    } catch (e) {
        console.error(e);
        respond.rethrow(e);

        respond.status(500).message({ error: 'Internal server error' }).throw();
    }
});

projectsRouter.get('/find-by-name/:name', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const projectsData = await db.query.projects.findFirst({
            where: eq(projects.name, req.params.name),
            with: {
                projectVersions: {
                    orderBy: desc(projectVersions.version),
                    limit: 1,
                },
            },
        });

        if (!projectsData) {
            respond.status(404).message({ error: 'Project not found' }).throw();
            return;
        }

        const project = {
            id: projectsData.id,
            name: projectsData.name,
            latest_version: projectsData.projectVersions[0]
                ? projectsData.projectVersions[0].version
                : null,
        };

        respond.status(200).message(project).throw();
    } catch (e) {
        console.error(e);
        respond.rethrow(e);

        respond.status(500).message({ error: 'Internal server error' }).throw();
    }
});

export default projectsRouter;
