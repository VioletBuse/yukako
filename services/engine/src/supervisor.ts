import * as path from 'path';
import { nanoid } from 'nanoid';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import chalk from 'chalk';
import bin from 'workerd';
import * as util from 'util';
import prexit from 'prexit';
import * as fs from 'fs-extra';

let name = 'workerd-instance';
let configLocation: string = path.join(
    process.cwd(),
    './.yukako/engine/config.capnp',
);
let workerdProcess: ChildProcessWithoutNullStreams | null = null;
let manualTermination = false;

const parseLog = (str: string) => {
    const isWorkerdLog = !(
        str.startsWith('__START_YUKAKO_LOG_HEADER__') &&
        str.includes('__END_YUKAKO_LOG_HEADER__ ')
    );
    if (isWorkerdLog) {
        return {
            type: 'workerd',
            value: str,
        };
    }

    const trimStart = str.replace('__START_YUKAKO_LOG_HEADER__', '');
    const [_data, log] = trimStart.split('__END_YUKAKO_LOG_HEADER__ ');

    const data = JSON.parse(_data);

    const logInvalidData = () => {
        console.error('Received invalid log data from workerd');
        console.error(_data, log);
        return {
            type: 'workerd',
            value: 'Received invalid log data from workerd: ' + _data,
            id: 'no log id provided',
            name: 'no log name provided',
        };
    };

    if (!('type' in data) || !('id' in data) || !('name' in data)) {
        return logInvalidData();
    }

    const id = data.id;
    const type = data.type;
    const name = data.name;

    if (
        typeof id !== 'string' ||
        typeof type !== 'string' ||
        typeof name !== 'string'
    ) {
        return logInvalidData();
    }

    switch (type) {
        case 'worker': {
            return {
                type: 'client-worker',
                value: log,
                id,
                name,
            };
        }
        case 'router': {
            return {
                type: 'router',
                value: log,
                id,
                name,
            };
        }
        default: {
            return logInvalidData();
        }
    }
};

const handleStdOut = () => {
    return (data: string | Buffer) => {
        const str = data.toString();

        const log = parseLog(str);

        // console.log(
        //     `[workerd][${name}][${log.type}][id:${
        //         log.id ?? 'no log id provided'
        //     }] ${log.value.trimEnd()}`,
        // );

        console.log(util.inspect(log, false, null, true /* enable colors */));
    };
};

const handleStdErr = () => {
    return (data: string | Buffer) => {
        const str = data.toString();

        const log = parseLog(str);

        // console.error(`[${chalk.red('workerd')}][${name}] ${str.trimEnd()}`);

        console.error(util.inspect(log, false, null, true /* enable colors */));
    };
};

const handleExit = (opts?: { sockets?: string[] }) => {
    return (code: number) => {
        if (opts?.sockets) {
            opts.sockets.forEach((socket) => {
                console.log(chalk.bold(`Removing socket ${socket}`));
                fs.rmSync(socket, { recursive: true, force: true });
            });
        }

        if (code !== 0) {
            console.error(chalk.red(`[workerd][${name}] exited.`));
        } else {
            console.log(`[workerd][${name}] exited.`);
        }

        console.log(`manual termination: ${manualTermination}`);
        if (!manualTermination) {
            console.log(
                chalk.red.bold(`[${name}] Restarting workerd in 1s...`),
            );
            workerdProcess?.kill();
            workerdProcess = null;
            // this.start();
            setTimeout(() => {
                WorkerdSupervisor.start(configLocation);
            }, 1000);
        }
    };
};

const handleError = () => {
    return (err: Error) => {
        console.error(err);

        if (!manualTermination) {
            console.log(
                chalk.red.bold(`[${name}] Restarting workerd in 1s...`),
            );
            workerdProcess?.kill();
            workerdProcess = null;
            // this.start();
            setTimeout(() => {
                WorkerdSupervisor.start(configLocation);
            }, 1000);
        }
    };
};

export const WorkerdSupervisor = {
    start: (
        _configlocation: string,
        opts?: {
            sockets?: string[];
        },
    ) => {
        configLocation = _configlocation;
        manualTermination = false;
        console.log(chalk.bold(`Starting workerd process ${name}`));
        const workerd = spawn(bin, ['serve', configLocation, '--verbose']);

        workerd.stdout.on('data', handleStdOut());
        workerd.stderr.on('data', handleStdErr());
        workerd.on('exit', handleExit());
        workerd.on('error', handleError());

        workerdProcess = workerd;
    },
    stop: (opts?: { sockets?: string[] }) => {
        if (opts?.sockets) {
            opts.sockets.forEach((socket) => {
                console.log(chalk.bold(`Removing socket ${socket}`));
                fs.rmSync(socket, { recursive: true, force: true });
            });
        }

        manualTermination = true;
        workerdProcess?.kill();
        workerdProcess = null;
    },
    restart: (
        _configLocation: string = configLocation,
        opts?: {
            sockets?: string[];
        },
    ) => {
        configLocation = _configLocation;
        manualTermination = true;

        console.log(`manual termination: ${manualTermination}`);

        workerdProcess?.kill();
        workerdProcess = null;

        if (opts?.sockets) {
            opts.sockets.forEach((socket) => {
                console.log(chalk.bold(`Removing socket ${socket}`));
                fs.rmSync(socket, { recursive: true, force: true });
            });
        }

        setTimeout(() => {
            WorkerdSupervisor.start(_configLocation);
        }, 1000);
    },
    setConfigLocation: (_configLocation: string) => {
        configLocation = _configLocation;
    },
    setName: (_name: string) => {
        name = _name;
    },
};

prexit(async () => {
    WorkerdSupervisor.stop();
});
