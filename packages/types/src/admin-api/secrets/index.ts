import { z } from 'zod';

export const SecretsNewSecretRequestBodySchema = z.object({
    name: z.string(),
    value: z.string(),
    projectId: z.string(),
});

export type SecretsNewSecretRequestBodyType = z.infer<
    typeof SecretsNewSecretRequestBodySchema
>;

export const SecretsSecretDataResponseBodySchema = z.object({
    name: z.string(),
    digest: z.string(),
    projectId: z.string(),
    disabled: z.boolean(),
    createdAt: z.number(),
});

export type SecretsSecretDataResponseBodyType = z.infer<
    typeof SecretsSecretDataResponseBodySchema
>;
