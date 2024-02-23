import { Command } from 'commander';
import { startDevServer } from '../dev';

export const dev = new Command()
    .command('dev')
    .description('dev server')
    .action(async () => {
        await startDevServer();
    });
