import postgres from 'postgres';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate as drizzleMigrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'url';
import * as path from 'path';

export const migrate = async (db: PostgresJsDatabase) => {
    // @ts-ignore
    const filename = __filename || fileURLToPath(import.meta.url);
    const dirname = __dirname || path.dirname(filename);

    const folder = path.join(dirname, 'migrations');

    try {
        await drizzleMigrate(db, {
            migrationsFolder: folder,
        });
    } catch (err) {
        console.error('An error occurred while running migrations:', err);
        process.exit(1);
    }
};
