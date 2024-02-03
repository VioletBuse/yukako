import postgres from 'postgres';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { PgWithReplicas, withReplicas } from 'drizzle-orm/pg-core';
import { run } from '@yukako/cli';
import * as schema from './schema';
import prexit from 'prexit';

declare global {
    var _pg: undefined | postgres.Sql;
    var _pgReadonly: undefined | postgres.Sql;
    var db: undefined | PgWithReplicas<PostgresJsDatabase<typeof schema>>;
}

export const getDatabase = (): PgWithReplicas<
    PostgresJsDatabase<typeof schema>
> => {
    if (!global.db) {
        try {
            const cli = run();

            const url = cli.postgres.url;
            const readonlyUrl = cli.postgres.readonlyUrl || url;

            const sql = postgres(url, {
                onnotice: () => {},
            });

            const readonlySql = postgres(readonlyUrl, {
                onnotice: () => {},
            });

            global._pg = sql;
            global._pgReadonly = readonlySql;

            const db = drizzle(sql, { schema });
            const readonlyDb = drizzle(readonlySql, { schema });

            const fullDB = withReplicas(db, [readonlyDb]);

            global.db = fullDB;
        } catch (err) {
            if (err instanceof Error && err.message.includes('ECONNREFUSED')) {
                console.error(
                    'Could not connect to the database. Please ensure that the database is running and that the connection information is correct.',
                );
            } else {
                console.error(
                    'An error occurred while connecting to the database:',
                    err,
                );
            }

            console.error('Exiting...');
            process.exit(1);
        }
    }

    return global.db;
};

export const getSql = (): postgres.Sql => {
    if (!global._pg) {
        getDatabase();
    }

    return global._pg!;
};

export const getReadonlySql = (): postgres.Sql => {
    if (!global._pgReadonly) {
        getDatabase();
    }

    return global._pgReadonly!;
};

prexit(async () => {
    if (global._pg) {
        await global._pg.end();
    }

    if (global._pgReadonly) {
        await global._pgReadonly.end();
    }
});
