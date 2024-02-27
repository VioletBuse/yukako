import { getConnection, resetConnection } from '../connection';
import stringHash from 'string-hash';

const handleError = async (err: unknown) => {
    console.error(err);
    await resetConnection();
};

export const checkLock = async (lock: string) => {
    try {
        const lockId = stringHash(lock);
        const connection = await getConnection();
        const res: { pg_try_advisory_lock: boolean }[] =
            await connection`SELECT pg_try_advisory_lock(${lockId})`;

        if (res.length === 0) {
            console.error('No result from pg_try_advisory_lock');
            return false;
        }

        if (!('pg_try_advisory_lock' in res[0])) {
            console.error('No pg_try_advisory_lock in result');
            return false;
        }

        if (res[0].pg_try_advisory_lock) {
            console.log(`Acquired lock ${lock}`);
            return true;
        }

        console.log(`Failed to acquire lock ${lock}`);
        return false;
    } catch (err) {
        await handleError(err);
        return false;
    }
};
