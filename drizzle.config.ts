import { Config } from 'drizzle-kit';

export default {
    schema: './packages/state/src/db/schema.ts',
    out: './migrations',
} satisfies Config;
