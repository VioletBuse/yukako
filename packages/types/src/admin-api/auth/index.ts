import { z } from 'zod';

export const AuthLoginResponseBodySchema = z.object({
    success: z.boolean(),
    sessionId: z.string(),
    uid: z.string(),
});

export type AuthLoginResponseBodyType = z.infer<
    typeof AuthLoginResponseBodySchema
>;

export const AuthRegisterResponseBodySchema = z.object({
    success: z.boolean(),
    sessionId: z.string(),
    uid: z.string(),
});

export type AuthRegisterResponseBodyType = z.infer<
    typeof AuthRegisterResponseBodySchema
>;

export const AuthNewAuthTokenResponseBodySchema = z.object({
    success: z.boolean(),
    token: z.string(),
});

export type AuthNewAuthTokenResponseBodyType = z.infer<
    typeof AuthNewAuthTokenResponseBodySchema
>;

export const AuthMeResponseBodySchema = z.object({
    uid: z.string(),
    username: z.string(),
    sessionId: z.string(),
});

export type AuthMeResponseBodyType = z.infer<typeof AuthMeResponseBodySchema>;
