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

export const ProjectsProjectDataResponseBodySchema = z.object({
    id: z.string(),
    name: z.string(),
    latest_version: z.union([z.null(), z.number()]),
});

export type ProjectsProjectDataResponseBodyType = z.infer<
    typeof ProjectsProjectDataResponseBodySchema
>;
