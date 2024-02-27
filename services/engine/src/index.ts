import * as path from 'path';
import { Engineer } from '@yukako/engineer';
import { loadProjects } from './loader';
import { getSql } from '@yukako/state/src/db/init';
import * as util from 'util';
import fs from 'fs-extra';
import { run } from '@yukako/cli';

export const EngineService = {
    start: async (workerId: string) => {
        const cli = run();

        const reload = async () => {
            console.log('new project version received.');
            const workers = await loadProjects();

            const workerPath = path.join(cli.directory, workerId);

            const enginePath = path.join(workerPath, './engine');
            const adminPath = path.join(workerPath, './admin');

            Engineer.stop({ engineDirectory: enginePath });
            Engineer.start({
                engineDirectory: enginePath,
                adminDirectory: adminPath,
                workerId,
                workers,
            });

            console.log('Engine service reloaded');
        };

        const sql = getSql();

        sql.listen('project_versions', reload, reload);

        console.log('Starting engine service...');
    },
    stop: (workerId: string) => {
        const cli = run();
        const workerPath = path.join(cli.directory, workerId);
        const enginePath = path.join(workerPath, './engine');

        Engineer.stop({ engineDirectory: enginePath });
    },
};
