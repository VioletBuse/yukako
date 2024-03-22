import { Router } from 'express';
import { respond } from '../../middleware/error-handling/throwable';
import { YukakoInternalQueuesCreateJobBodySchema } from '@yukako/types';
import { getDatabase } from '@yukako/state';
import { queueJob } from '@yukako/state/src/db/schema';
import { nanoid } from 'nanoid';

const internalQueuesRouter = Router();

internalQueuesRouter.post('/create/:queueID', async (req, res) => {
    try {
        const { queueID } = req.params;
        const body = req.body;

        const { data } = YukakoInternalQueuesCreateJobBodySchema.parse(body);

        const db = getDatabase();

        const newJob = await db
            .insert(queueJob)
            .values({
                id: nanoid(),
                queueId: queueID,
                data,
            })
            .returning();

        respond.status(200).message(newJob).throw();
    } catch (err) {
        let message = 'An error occurred while adding job to queue.';

        if (err.message) {
            message = err.message;
        }

        respond.status(500).message(message).throw();
    }
});

export default internalQueuesRouter;
