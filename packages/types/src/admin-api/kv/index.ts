import { z } from 'zod';

export const KvKvDataResponseBodySchema = z.object({
    id: z.string(),
    name: z.string(),
    created_at: z.number(),
    projects: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
        }),
    ),
});

export type KvKvDataResponseBodyType = z.infer<
    typeof KvKvDataResponseBodySchema
>;
