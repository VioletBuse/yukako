import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { getReadonlySql, getSql } from './init';

export const testDB = async (db: PostgresJsDatabase) => {
    try {
        const sql = getSql();
        await sql`SELECT 1`;

        const roSql = getReadonlySql();
        await roSql`SELECT 1`;
    } catch (err) {
        console.error(
            'Could not connect to the database. Please ensure that the database is running and that the connection information is correct.',
        );
        console.error('Exiting...');
        process.exit(1);
    }
};
