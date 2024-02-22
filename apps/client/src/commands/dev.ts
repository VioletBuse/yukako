import { Command } from 'commander';
import { getConfig, getDeployments } from '../util/yukakoproj/get-data';
import { select } from '@inquirer/prompts';
import { configToVersionPush } from '../util/yukakoproj';
import { watchConfig } from '../util/yukakoproj/watch-config';
import chalk from 'chalk';

export const dev = new Command()
    .command('dev')
    .description('dev server')
    .action(async () => {
        try {
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
                            console.log('new config');
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
