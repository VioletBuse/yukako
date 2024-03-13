import { z } from 'zod';

export const baseConfigSchema = z.object({
    folder: z.string(),
    entrypoint: z.string(),

    routes: z.array(
        z.object({
            host: z.string(),
            paths: z.array(z.string()),
        }),
    ),

    text_bindings: z
        .array(
            z.union([
                z.object({
                    name: z.string(),
                    value: z.string(),
                }),
                z.object({
                    name: z.string(),
                    file: z.string(),
                }),
            ]),
        )
        .optional(),

    json_bindings: z
        .array(
            z.union([
                z.object({
                    name: z.string(),
                    value: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.null(),
                        z.array(z.any()),
                        z.record(z.any()),
                    ]),
                }),
                z.object({
                    name: z.string(),
                    file: z.string(),
                }),
            ]),
        )
        .optional(),

    data_bindings: z
        .array(
            z.union([
                z.object({
                    name: z.string(),
                    base64: z.string(),
                }),
                z.object({
                    name: z.string(),
                    file: z.string(),
                }),
            ]),
        )
        .optional(),

    environment_bindings: z
        .array(
            z.object({
                name: z.string(),
                env_var: z.string(),
            }),
        )
        .optional(),

    kv_bindings: z
        .array(
            z.object({
                name: z.string(),
                kv_database_id: z.string(),
            }),
        )
        .optional(),

    sites: z
        .array(
            z.object({
                name: z.string(),
                folder: z.string(),
            }),
        )
        .optional(),

    cron_jobs: z
        .array(
            z.object({
                name: z.string(),
                cron: z.string(),
            }),
        )
        .optional(),
});

export const baseDeploymentSchema = z.object({
    server: z.string(),
    name: z.string(),
    id: z.string(),
});

export const deploymentSchema = baseDeploymentSchema.merge(
    baseConfigSchema.partial(),
);

export const deploymentFileSchema = z.object({
    deployments: z.array(deploymentSchema),
});

export const configFileSchema = baseConfigSchema.merge(deploymentFileSchema);
