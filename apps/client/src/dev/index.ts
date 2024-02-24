import path from 'path';
import { NewProjectVersionRequestBodyType } from '@yukako/types';
import { AddWorkerData, Engineer } from '@yukako/engineer';
import { base64Hash, base64ToDataView } from '@yukako/base64ops';
import { watchConfig } from '../util/yukakoproj/watch-config';
import chalk from 'chalk';
import { getConfig, getDeployments } from '../util/yukakoproj/get-data';
import { select } from '@inquirer/prompts';
import { configToVersionPush } from '../util/yukakoproj';
import { configToWorkers } from './new-version-config-to-worker';
import { startAdminMock, stopAdminMock } from './mocks/admin';
import { startLeaderMock, stopLeaderMock } from './mocks/leader';
import { startProxyMock, stopProxyMock } from './mocks/proxy';
import { mockKv } from './mocks/admin/db/kv';
import * as fs from 'fs-extra';

export const startDevServer = async () => {
    try {
        const workdir = process.cwd();
        const dir = path.join(workdir, '.yukako_cli');
        const engineDirectory = path.join(dir, 'engine');
        const adminDirectory = path.join(dir, 'admin');
        const workerId = 'dev-worker';

        let stopWatchProject: () => void;
        let deploymentId: string | undefined;
        const { stop: stopWatch } = watchConfig(async () => {
            stopWatchProject?.();
            console.log(`${chalk.green('✔')} New config`);

            const deployments = getDeployments();

            if (deploymentId) {
                deploymentId = deployments.find(
                    (deployment) => deployment.id === deploymentId,
                )
                    ? deploymentId
                    : undefined;
            }

            if (!deploymentId && deployments.length > 0) {
                if (deployments.length === 1) {
                    deploymentId = deployments[0].id;
                } else {
                    const deployment = await select({
                        message: 'Select deployment',
                        choices: deployments.map((deployment) => ({
                            name: `${deployment.name} (${deployment.id})`,
                            value: deployment,
                        })),
                    });

                    deploymentId = deployment.id;
                }
            }

            if (!deploymentId) {
                console.error(chalk.red('No deployment selected'));
                return;
            }
            const projectConfig = getConfig(deploymentId);

            const { start, stop } = await configToVersionPush(projectConfig, {
                watch: true,
                onChange: (val) => {
                    const worker = configToWorkers(val);
                    Engineer.stop({ engineDirectory });
                    stopAdminMock();
                    stopLeaderMock();
                    stopProxyMock();

                    startAdminMock(
                        path.join(engineDirectory, 'engine.sock'),
                        path.join(adminDirectory, 'admin.sock'),
                    );
                    startLeaderMock(
                        path.join(engineDirectory, 'engine.sock'),
                        path.join(adminDirectory, 'admin.sock'),
                    );
                    startProxyMock(
                        path.join(engineDirectory, 'engine.sock'),
                        path.join(adminDirectory, 'admin.sock'),
                        3000,
                    );

                    Engineer.start({
                        workerId,
                        engineDirectory,
                        adminDirectory,
                        workers: [worker],
                    });
                },
            });

            await start();
            stopWatchProject = stop;
        });

        const cleanup = async () => {
            stopWatchProject?.();
            stopWatch?.();
            Engineer.stop({ engineDirectory });
            stopAdminMock();
            stopLeaderMock();
            stopProxyMock();
            mockKv.serializeKvs();
            fs.rmSync(engineDirectory, { recursive: true, force: true });

            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    } catch (err) {
        console.error('Failed to start dev server', err);
        process.exit(1);
    }
};
