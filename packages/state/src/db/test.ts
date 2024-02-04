import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { getReadonlySql, getSql } from './init';
import { run } from '@yukako/cli';

export const testDB = async (db: PostgresJsDatabase) => {
    try {
        const sql = getSql();
        await sql`SELECT 1`;
    } catch (err) {
        const cli = run();
        const url = cli.postgres.url;

        console.error(
            `Could not connect to the database at ${url}. Please ensure that the database is running and that the connection information is correct.`,
        );

        console.error('Exiting...');
        process.exit(1);
    }

    //test readonly database
    try {
        const roSql = getReadonlySql();
        await roSql`SELECT 1`;
    } catch (err) {
        const cli = run();
        const url = cli.postgres.readonlyUrl;

        console.error(
            `Could not connect to the database at ${url}. Please ensure that the database is running and that the connection information is correct.`,
        );

        console.error('Exiting...');
        process.exit(1);
    }
};
