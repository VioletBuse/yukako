import type { Config } from 'drizzle-kit';

export default {
    schema: './src/dev/mocks/admin/db/schema.ts',
    out: './drizzle',
    driver: 'better-sqlite',
} satisfies Config;
