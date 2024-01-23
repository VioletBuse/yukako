import { z } from 'zod';

export * from './versions';
export type * from './versions';

export const ProjectsNewProjectResponseBodySchema = z.object({
    success: z.boolean(),
    id: z.string(),
    name: z.string(),
});

export type ProjectsNewProjectResponseBodyType = z.infer<
    typeof ProjectsNewProjectResponseBodySchema
>;
