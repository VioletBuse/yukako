import { Config } from 'drizzle-kit';

export default {
    schema: './packages/state/src/db/schema/index.ts',
    out: './migrations',
} satisfies Config;
