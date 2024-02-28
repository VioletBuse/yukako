#!/usr/bin/env node

import { run } from '@yukako/cli';
import { migrate } from '@yukako/state';
import cluster from 'cluster';
import { nanoid } from 'nanoid';
import { AdminService } from '@yukako/admin';
import { EngineService } from '@yukako/engine';
import { ProxyService } from '@yukako/proxy';
import { LeaderService } from '@yukako/leader';
import { getDatabase } from '@yukako/state/src/db/init';
import { testDB } from '@yukako/state/src/db/test';

const cli = run();

const isMaster = cluster.isPrimary || cluster.isMaster;
const workers = cli.workerCount;

const id = cluster.worker?.id.toString() || nanoid();

if (isMaster) {
    console.log(`Starting node ${cli.nodeId}`);

    try {
        const db = getDatabase();
        await testDB(db);
        await migrate(db);
    } catch (err) {
        console.error('Error migrating database', err);
    }

    await LeaderService.start('1');

    for (let i = 0; i < workers; i++) {
        cluster.fork();
    }
} else {
    await AdminService.start(id);
    await EngineService.start(id);
    await ProxyService.start(id);
}

const exitHandler = (
    opts: {
        cleanup?: boolean;
        exit?: boolean;
    },
    exitCode: number,
) => {
    if (opts.cleanup) {
        // const workdir = path.join(process.cwd(), './.yukako/', id);
        // console.log(`Cleaning up ${workdir}`);
        // fs.rmSync(workdir, { recursive: true, force: true });
    }

    if (exitCode || exitCode === 0) {
        console.log(`Exit code: ${exitCode}`);
    }

    if (opts.exit) {
        process.exit();
    }
};

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
