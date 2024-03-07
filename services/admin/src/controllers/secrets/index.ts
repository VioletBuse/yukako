import { Router } from 'express';
import { respond } from '../../middleware/error-handling/throwable';
import { ZodError } from 'zod';
import { getDatabase } from '@yukako/state';
import { authenticate } from '../../lib/authenticate';
import {
    SecretsNewSecretRequestBodySchema,
    SecretsSecretDataResponseBodyType,
} from '@yukako/types';
import { and, desc, eq } from 'drizzle-orm';
import {
    secrets,
    projects,
    projectVersions,
    secretBindings,
} from '@yukako/state/src/db/schema';
import { nanoid } from 'nanoid';
import { getSql } from '@yukako/state/src/db/init';
import { createHash } from 'crypto';

const secretsRouter = Router();

secretsRouter.post('/', async (req, res) => {
    try {
        const db = getDatabase();
        const _sql = getSql();

        await authenticate(req);

        const { name, value, projectId } =
            SecretsNewSecretRequestBodySchema.parse(req.body);

        const result = await db.$primary.transaction(async (txn) => {
            await txn
                .insert(secrets)
                .values({
                    name,
                    value,
                    projectId,
                })
                .onConflictDoUpdate({
                    target: [secrets.name, secrets.projectId],
                    set: {
                        value,
                        disabled: false,
                    },
                });

            const mostRecentVersion = await txn.query.projects.findFirst({
                where: eq(projects.id, projectId),
                with: {
                    projectVersions: {
                        limit: 1,
                        orderBy: desc(projectVersions.version),
                    },
                },
            });

            if (!mostRecentVersion || !mostRecentVersion.projectVersions[0]) {
                return;
            }

            const versionId = mostRecentVersion.projectVersions[0].id;

            await txn.insert(secretBindings).values({
                id: nanoid(),
                secretName: name,
                secretProjectId: projectId,
                versionId,
            });

            _sql.notify('project_versions', 'reload');
        });

        const data: SecretsSecretDataResponseBodyType = {
            name,
            projectId,
            digest: createHash('sha256')
                .update(new Buffer(value))
                .digest('hex'),
            disabled: false,
            createdAt: Date.now(),
        };
    } catch (err) {
        respond.rethrow(err);

        if (err instanceof ZodError) {
            respond.status(400).message({ error: 'Invalid request' }).throw();
            return;
        }

        respond.status(500).message({ error: 'Internal server error' }).throw();
    }
});

export default secretsRouter;
