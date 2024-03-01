import { Config } from 'drizzle-kit';

export default {
    schema: './packages/state/src/db/schema/index.ts',
    out: './migrations',
    driver: 'pg',
    dbCredentials: {
        connectionString:
            'postgres://postgres:postgres@localhost:5432/postgres',
    },
} satisfies Config;
