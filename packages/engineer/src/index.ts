import { WorkerdSupervisor } from './supervisor';
import { AddWorkerData, Configurator } from './configurator';
import path from 'path';

export const Engineer = {
    start: (opts: {
        workerId: string;
        engineDirectory: string;
        adminDirectory: string;
        workers: AddWorkerData[];
    }) => {
        const adminSocket = path.resolve(opts.adminDirectory, 'admin.sock');
        const engineSocket = path.resolve(opts.engineDirectory, 'engine.sock');

        const configPath = path.join(opts.engineDirectory, 'config.capnp');

        const config = Configurator.new({
            adminApiAddress: adminSocket,
            workerId: opts.workerId,
            listenAddress: engineSocket,
        });

        opts.workers.forEach((worker) => {
            config.addWorker(worker);
        });

        config.writeConfig(configPath);

        WorkerdSupervisor.start(configPath, opts.workerId, {
            sockets: [engineSocket],
        });
    },
    stop: (opts: { engineDirectory: string }) => {
        WorkerdSupervisor.stop({
            sockets: [path.resolve(opts.engineDirectory, 'engine.sock')],
        });
    },
};
