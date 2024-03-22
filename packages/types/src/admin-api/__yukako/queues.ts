import { z } from 'zod';

export const YukakoInternalQueuesCreateJobBodySchema = z.object({
    data: z.any(),
});

export type YukakoInternalQueuesCreateJobBodyType = z.infer<
    typeof YukakoInternalQueuesCreateJobBodySchema
>;
