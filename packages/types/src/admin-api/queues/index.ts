import { z } from 'zod';

export const QueueQueueDataResponseBodySchema = z.object({
    id: z.string(),
    name: z.string(),
});

export type QueueQueueDataResponseBodyType = z.infer<
    typeof QueueQueueDataResponseBodySchema
>;
