import postgres from 'postgres';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate as drizzleMigrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'url';
import * as path from 'path';

export const migrate = async (db: PostgresJsDatabase) => {
    const filename = __filename || fileURLToPath(import.meta.url);
    const dirname = __dirname || path.dirname(filename);

    const folder = path.join(dirname, 'migrations');

    await drizzleMigrate(db, {
        migrationsFolder: folder,
    });
};
