import { z } from 'zod';

export const UsersUserDataResponseBodySchema = z.object({
    uid: z.string(),
    username: z.string(),
    invitedBy: z.union([
        z.null(),
        z.object({ username: z.string(), uid: z.string() }),
    ]),
    invitees: z.array(z.object({ uid: z.string(), username: z.string() })),
    createdAt: z.number(),
});

export type UsersUserDataResponseBodyType = z.infer<
    typeof UsersUserDataResponseBodySchema
>;
