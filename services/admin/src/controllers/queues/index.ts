import { Router } from 'express';
import { respond } from '../../middleware/error-handling/throwable';
import { z, ZodError } from 'zod';
import { getDatabase } from '@yukako/state';
import { authenticate } from '../../lib/authenticate';
import { queues } from '@yukako/state/src/db/schema';
import { nanoid } from 'nanoid';
import { QueueQueueDataResponseBodyType } from '@yukako/types/src/admin-api/queues';
import { eq } from 'drizzle-orm';

const queuesRouter = Router();

queuesRouter.post('/', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const body = z
            .object({
                name: z.string(),
            })
            .parse(req.body);

        const result = await db
            .insert(queues)
            .values({
                id: nanoid(),
                name: body.name,
            })
            .returning();

        if (result.length !== 1) {
            respond.status(500).message('Internal Server Error').throw();
        }

        const data: QueueQueueDataResponseBodyType = {
            id: result[0].id,
            name: result[0].name,
        };

        respond.status(201).message(data).throw();
    } catch (err) {
        respond.rethrow(err);

        if (err instanceof ZodError) {
            respond.status(400).message('Bad Request').throw();
        }

        respond.status(500).message('Internal Server Error').throw();
        throw err;
    }
});

queuesRouter.get('/:id', async (req, res) => {
    try {
        const db = getDatabase();

        await authenticate(req);

        const id = req.params.id;

        const result = await db.query.queues.findFirst({
            where: eq(queues.id, id),
        });

        if (!result) {
            respond.status(404).message('Not Found').throw();
        }

        const data: QueueQueueDataResponseBodyType = {
            id: result.id,
            name: result.name,
        };

        respond.status(200).message(data).throw();
    } catch (err) {
        respond.rethrow(err);

        if (err instanceof ZodError) {
            respond.status(400).message('Bad Request').throw();
        }

        respond.status(500).message('Internal Server Error').throw();
        throw err;
    }
});

export default queuesRouter;
