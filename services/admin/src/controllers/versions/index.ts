import { Router } from 'express';
import { respond } from '../../middleware/error-handling/throwable';
import { getDatabase } from '@yukako/state';
import { authenticate } from '../../lib/authenticate';
import { parseInt } from 'lodash';
import { desc } from 'drizzle-orm';
import { projectVersions } from '@yukako/state/src/db/schema';
import { ProjectVersionsDataResponseBodyType } from '@yukako/types';
import { base64Hash } from '@yukako/base64ops';

const versionsRouter = Router();

versionsRouter.get('/', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        let limit = 5;
        let page = 0;

        if (req.query.limit) {
            const parsedLimit = parseInt(req.query.limit as string);
            if (!isNaN(parsedLimit)) {
                limit = parsedLimit;
            }
        }

        if (req.query.page) {
            const parsedPage = parseInt(req.query.page as string);
            if (!isNaN(parsedPage)) {
                page = parsedPage;
            }
        }

        const data = await db.query.projectVersions.findMany({
            orderBy: desc(projectVersions.createdAt),
            with: {
                project: true,
                projectVersionBlobs: {
                    with: {
                        blob: true,
                    },
                },
                routes: true,
                textBindings: true,
                jsonBindings: true,
                dataBindings: true,
                kvDatabases: true,
                queueBindings: true,
                envVarBindings: true,
                queueBindings: true,
                sites: {
                    with: {
                        files: true,
                    },
                },
            },
            limit,
            offset: page * limit,
        });

        const versions: ProjectVersionsDataResponseBodyType[] = data.map(
            (projectVersion): ProjectVersionsDataResponseBodyType => {
                const routes = projectVersion.routes.map((route) => ({
                    id: route.id,
                    host: route.host,
                    basePaths: route.basePaths,
                }));

                const blobs = projectVersion.projectVersionBlobs.map(
                    (blob) => ({
                        id: blob.blob.id,
                        digest: base64Hash(blob.blob.data),
                        filename: blob.blob.filename,
                        type: blob.blob.type,
                    }),
                );

                const textBindings = projectVersion.textBindings.map(
                    (binding) => ({
                        id: binding.id,
                        name: binding.name,
                        value: binding.value,
                    }),
                );

                const jsonBindings = projectVersion.jsonBindings.map(
                    (binding) => ({
                        id: binding.id,
                        name: binding.name,
                        value: binding.value,
                    }),
                );

                const dataBindings = projectVersion.dataBindings.map(
                    (binding) => ({
                        id: binding.id,
                        name: binding.name,
                        digest: base64Hash(binding.base64),
                    }),
                );

                const envVarBindings = projectVersion.envVarBindings.map(
                    (binding) => ({
                        name: binding.name,
                        envVar: binding.envVar,
                    }),
                );

                const kvBindings = projectVersion.kvDatabases.map(
                    (binding) => ({
                        name: binding.name,
                        kvDatabaseId: binding.kvDatabaseId,
                    }),
                );

                const queueBindings = projectVersion.queueBindings.map(
                    (binding) => ({
                        name: binding.name,
                        queueId: binding.queueId,
                    }),
                );

                const siteBindings = projectVersion.sites.map((site) => ({
                    name: site.name,
                    files: site.files.map((file) => ({
                        path: file.path,
                        digest: base64Hash(file.base64),
                    })),
                }));

                return {
                    id: projectVersion.id,
                    version: projectVersion.version,
                    projectId: projectVersion.projectId,
                    deployed_at: projectVersion.createdAt.getTime(),
                    routes,
                    blobs,
                    textBindings,
                    jsonBindings,
                    dataBindings,
                    envVarBindings,
                    kvBindings,
                    queueBindings,
                    siteBindings,
                };
            },
        );

        respond.status(200).message(versions).throw();
    } catch (err) {
        respond.rethrow(err);

        respond
            .status(500)
            .message({ error: 'An internal server error occurred.' })
            .throw();
    }
});

export default versionsRouter;
