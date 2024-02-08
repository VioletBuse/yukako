import { z } from 'zod';

export const NewProjectVersionRequestBodySchema = z.object({
    blobs: z
        .array(
            z.object({
                data: z.string(),
                filename: z.string(),
                type: z.union([
                    z.literal('esmodule'),
                    z.literal('wasm'),
                    z.literal('json'),
                    z.literal('text'),
                    z.literal('data'),
                ]),
            }),
        )
        .min(1),
    routes: z
        .array(
            z.object({
                host: z.string(),
                basePaths: z.array(z.string()),
            }),
        )
        .min(1),
    textBindings: z
        .array(
            z.object({
                name: z.string(),
                value: z.string(),
            }),
        )
        .nullish(),
    jsonBindings: z
        .array(
            z.object({
                name: z.string(),
                value: z.any(),
            }),
        )
        .nullish(),
    dataBindings: z
        .array(
            z.object({
                name: z.string(),
                base64: z.string(),
            }),
        )
        .nullish(),
});

export type NewProjectVersionRequestBodyType = z.infer<
    typeof NewProjectVersionRequestBodySchema
>;

export const ProjectVersionsDataResponseBodySchema = z.object({
    id: z.string(),
    version: z.number(),
    projectId: z.string(),
    deployed_at: z.number(),
    routes: z.array(
        z.object({
            host: z.string(),
            basePaths: z.array(z.string()),
        }),
    ),
    blobs: z.array(
        z.object({
            id: z.string(),
            digest: z.string(),
            filename: z.string(),
            type: z.union([
                z.literal('esmodule'),
                z.literal('wasm'),
                z.literal('json'),
                z.literal('text'),
                z.literal('data'),
            ]),
        }),
    ),
    textBindings: z.array(
        z.object({
            name: z.string(),
            value: z.string(),
        }),
    ),
    jsonBindings: z.array(
        z.object({
            name: z.string(),
            value: z.any(),
        }),
    ),
    dataBindings: z.array(
        z.object({
            name: z.string(),
            digest: z.string(),
        }),
    ),
});

export type ProjectVersionsDataResponseBodyType = z.infer<
    typeof ProjectVersionsDataResponseBodySchema
>;
