import { test } from '@yukako/extensions';
import * as path from 'path';
import { WorkerdSupervisor } from './supervisor';
import { Configurator } from './configurator';
import { loadProjects } from './loader';
import { getSql } from '@yukako/state/src/db/init';
import * as util from 'util';
import fs from 'fs-extra';

export const EngineService = {
    start: async (workerId: string) => {
        const reload = async () => {
            console.log('new project version received.');
            const workers = await loadProjects();

            // console.log('workers');
            // console.log(
            //     util.inspect(workers, false, null, true /* enable colors */),
            // );

            const workerPath = path.join(process.cwd(), './.yukako', workerId);

            const enginePath = path.join(workerPath, './engine');
            const adminPath = path.join(workerPath, './admin');

            const engineSocket = path.join(enginePath, './engine.sock');
            const adminSocket = path.join(adminPath, './admin.sock');

            const config = Configurator.new({
                workerId: workerId,
                listenAddress: `unix:${engineSocket}`,
                adminApiAddress: `unix:${adminSocket}`,
            });

            workers.forEach((worker) => {
                config.addWorker(worker);
            });

            const configPath = path.join(enginePath, './config.capnp');

            config.writeConfig(configPath);

            // const writtenContents = fs.readFileSync(configPath, 'utf8');
            //
            // console.log('writtenContents', writtenContents);

            WorkerdSupervisor.setName(workerId);
            WorkerdSupervisor.restart(configPath, {
                sockets: [engineSocket],
            });

            console.log('Engine service reloaded');
        };

        const sql = getSql();

        sql.listen('project_versions', reload, reload);

        console.log('Starting engine service...');
    },
    stop: () => {
        WorkerdSupervisor.stop();
    },
    restart: () => {
        WorkerdSupervisor.restart();
    },
};
