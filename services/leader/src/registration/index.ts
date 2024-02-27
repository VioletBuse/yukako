import {
    AsyncTask,
    SimpleIntervalJob,
    Task,
    ToadScheduler,
} from 'toad-scheduler';
import { checkLock } from '../leader';
import { getDatabase } from '@yukako/state';
import { yukakoNode } from '@yukako/state/src/db/schema';
import { lt } from 'drizzle-orm';
import { run } from '@yukako/cli';

const scheduler = new ToadScheduler();

const refreshNodeRegistrationTask = new AsyncTask(
    'Refresh Node Registration',
    async () => {
        const cli = run();

        const db = getDatabase();

        await db
            .insert(yukakoNode)
            .values({
                id: cli.nodeId,
                lastOnline: new Date(),
            })
            .onConflictDoUpdate({
                target: yukakoNode.id,
                set: {
                    lastOnline: new Date(),
                },
            });
    },
);

const refreshNodeRegistrationJob = new SimpleIntervalJob(
    { seconds: 30, runImmediately: true },
    refreshNodeRegistrationTask,
    { id: 'refreshNodeRegistrationJob' },
);

const cleanupNodeRegistrationTask = new AsyncTask(
    'Cleanup Node Registration',
    async () => {
        const lock = await checkLock('leader:node-registration-cleanup');

        if (!lock) return;

        const db = getDatabase();

        const SIXTY_SECONDS_AGO = new Date(Date.now() - 60 * 1000);

        await db
            .delete(yukakoNode)
            .where(lt(yukakoNode.lastOnline, SIXTY_SECONDS_AGO));

        return;
    },
);

const cleanupNodeRegistrationJob = new SimpleIntervalJob(
    { seconds: 20, runImmediately: false },
    cleanupNodeRegistrationTask,
    { id: 'cleanupNodeRegistrationJob' },
);

export const NodeRegistrationManager = {
    start: () => {
        scheduler.addSimpleIntervalJob(refreshNodeRegistrationJob);
        scheduler.addSimpleIntervalJob(cleanupNodeRegistrationJob);
    },
    stop: () => {
        scheduler.stop();
        scheduler.removeById('refreshNodeRegistrationJob');
        scheduler.removeById('cleanupNodeRegistrationJob');
    },
};
