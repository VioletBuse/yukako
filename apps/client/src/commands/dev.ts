import { Command } from 'commander';
import { getConfig, getDeployments } from '../util/yukakoproj/get-data';
import { select } from '@inquirer/prompts';
import { configToVersionPush } from '../util/yukakoproj';
import { watchConfig } from '../util/yukakoproj/watch-config';
import chalk from 'chalk';
import { NewProjectVersionRequestBodyType } from '@yukako/types';
import { AddWorkerData, Engineer } from '@yukako/engineer';
import path from 'path';
import { base64Hash, base64ToDataView } from '@yukako/base64ops';

export const dev = new Command()
    .command('dev')
    .description('dev server')
    .action(async () => {
        try {
            const workdir = process.cwd();
            const dir = path.join(workdir, '.yukako_cli');
            const engineDirectory = path.join(dir, 'engine');
            const adminDirectory = path.join(dir, 'admin');
            const workerId = 'dev-worker';

            const configToWorkers = (
                val: NewProjectVersionRequestBodyType,
            ): AddWorkerData => {
                return {
                    name: 'dev-worker',
                    modules: val.blobs.map(
                        (blob): AddWorkerData['modules'][number] => ({
                            importName: blob.filename,
                            fileName: base64Hash(blob.data),
                            fileContent: base64ToDataView(blob.data),
                            type: blob.type,
                        }),
                    ),
                    bindings: [],
                    routing: val.routes.map(
                        (route): AddWorkerData['routing'][number] => ({
                            host: '*',
                            basePaths: route.basePaths,
                        }),
                    ),
                };
            };

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

                const { start, stop } = await configToVersionPush(
                    projectConfig,
                    {
                        watch: true,
                        onChange: (val) => {
                            const worker = configToWorkers(val);
                            Engineer.stop({ engineDirectory });
                            Engineer.start({
                                workerId,
                                engineDirectory,
                                adminDirectory,
                                workers: [worker],
                            });
                        },
                    },
                );

                await start();
                stopWatchProject = stop;
            });

            const cleanup = async () => {
                stopWatchProject?.();
                stopWatch?.();

                process.exit(0);
            };

            process.on('SIGINT', cleanup);
            process.on('SIGTERM', cleanup);
        } catch (err) {
            console.error('Failed to start dev server', err);
            process.exit(1);
        }
    });
