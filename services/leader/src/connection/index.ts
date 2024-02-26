import { getSql } from '@yukako/state/src/db/init';
import postgres from 'postgres';

declare global {
    var _connection: undefined | postgres.ReservedSql;
}

export const getConnection = async () => {
    const sql = getSql();

    if (!global._connection) {
        const connection = await sql.reserve();
        global._connection = connection;
        return connection;
    } else {
        return global._connection;
    }
};

export const releaseConnection = async () => {
    if (global._connection) {
        await global._connection.release();
        global._connection = undefined;
    }
};

export const resetConnection = async () => {
    if (global._connection) {
        await global._connection.release();
        global._connection = undefined;
    }

    return await getConnection();
};
