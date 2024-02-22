import { Command } from 'commander';
import { getConfig, getDeployments } from '../util/yukakoproj/get-data';
import { select } from '@inquirer/prompts';
import { configToVersionPush } from '../util/yukakoproj';

export const dev = new Command()
    .command('dev')
    .description('dev server')
    .action(async () => {
        try {
            const deployments = getDeployments();

            const deployment = await select({
                message: 'Select deployment',
                choices: deployments.map((deployment) => ({
                    name: `${deployment.name} (${deployment.id})`,
                    value: deployment,
                })),
            });

            const projectConfig = getConfig(deployment.id);

            const { start, stop } = await configToVersionPush(projectConfig, {
                watch: true,
                onChange: (val) => {
                    console.log('new config');
                },
            });

            await start();

            process.on('SIGINT', async () => {
                await stop();
                process.exit(0);
            });

            process.on('SIGTERM', async () => {
                await stop();
                process.exit(0);
            });
        } catch (err) {
            console.error('Failed to start dev server', err);
            process.exit(1);
        }
    });
