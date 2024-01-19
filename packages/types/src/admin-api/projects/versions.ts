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

export type ProjectVersionInfoType = {
    id: string;
    version: number;
    projectId: string;
    routes: {
        host: string;
        basePaths: string[];
    }[];
    blobs: {
        id: string;
        data: string;
        filename: string;
        type: 'esmodule' | 'wasm' | 'json' | 'text' | 'data';
    }[];
    textBindings: {
        name: string;
        value: string;
    }[];
    jsonBindings: {
        name: string;
        value: any;
    }[];
    dataBindings: {
        name: string;
        base64: string;
    }[];
};
