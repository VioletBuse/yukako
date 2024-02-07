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
import type {
    ProjectsNewProjectResponseBodyType,
    ProjectsProjectDataResponseBodyType,
} from '@yukako/types';

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
                    .message({
                        error: `Project with name "${data.name}" already exists`,
                    })
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

            const returnData: ProjectsNewProjectResponseBodyType = {
                success: true,
                id: project[0].id,
                name: project[0].name,
            };

            return returnData;
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

        const projects: ProjectsProjectDataResponseBodyType[] =
            projectsData.map(
                (project): ProjectsProjectDataResponseBodyType => ({
                    id: project.id,
                    name: project.name,
                    latest_version: project.projectVersions[0]
                        ? {
                              id: project.projectVersions[0].id,
                              version: project.projectVersions[0].version,
                              created_at:
                                  project.projectVersions[0].createdAt.getTime(),
                          }
                        : null,
                    created_at: project.createdAt.getTime(),
                }),
            );

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

        const project: ProjectsProjectDataResponseBodyType = {
            id: projectData.id,
            name: projectData.name,
            latest_version: projectData.projectVersions[0]
                ? ({
                      id: projectData.projectVersions[0].id,
                      version: projectData.projectVersions[0].version,
                      created_at:
                          projectData.projectVersions[0].createdAt.getTime(),
                  } as ProjectsProjectDataResponseBodyType['latest_version'])
                : null,
            created_at: projectData.createdAt.getTime(),
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

        const project: ProjectsProjectDataResponseBodyType = {
            id: projectsData.id,
            name: projectsData.name,
            latest_version: projectsData.projectVersions[0]
                ? {
                      id: projectsData.projectVersions[0].id,
                      version: projectsData.projectVersions[0].version,
                      created_at:
                          projectsData.projectVersions[0].createdAt.getTime(),
                  }
                : null,
            created_at: projectsData.createdAt.getTime(),
        };

        respond.status(200).message(project).throw();
    } catch (e) {
        console.error(e);
        respond.rethrow(e);

        respond.status(500).message({ error: 'Internal server error' }).throw();
    }
});

export default projectsRouter;
