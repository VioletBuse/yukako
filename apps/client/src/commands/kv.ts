import { Command } from 'commander';
import ora from 'ora';
import { selectServer } from '../util/server-select.js';
import { readConfig } from '../util/main-config.js';
import { input } from '@inquirer/prompts';
import { Wrapper } from '@yukako/wrapper';
import chalk from 'chalk';

const create = new Command()
    .command('create')
    .option('-n, --name <name>', 'Name of the database')
    .option('-s, --server <server>', 'Server to create the database on')
    .action(async (options) => {
        const spinner = ora('Creating database');

        try {
            let server = await selectServer({
                spinner,
                canSelectWithoutLoggedIn: false,
                optionsObject: options,
            });

            if (!server) {
                throw new Error('No server selected');
            }

            const config = readConfig();
            const authToken = config.servers[server].auth.sessionId;

            if (!authToken) {
                throw new Error('Not logged in');
            }

            let name = options.name;

            if (typeof name !== 'string') {
                name = await input({
                    message: 'Name of the database',
                    validate: (val) =>
                        val.length > 0 ? true : 'Name cannot be empty',
                });
            }

            if (typeof name !== 'string' || name.length === 0) {
                throw new Error('Name cannot be empty');
            }

            spinner.start('Creating database...');

            const wrapper = Wrapper(server, authToken);

            const [res, err] = await wrapper.kv.create(name);

            if (err) {
                spinner.fail('Failed to create database');
            } else {
                spinner.succeed('Database created');
            }
        } catch (err) {
            let message = 'Failed to create database';

            if (err instanceof Error) {
                message += `: ${err.message}`;
            }

            spinner.fail(message);
        }
    });

const list = new Command()
    .command('list')
    .option('-s, --server <server>', 'Server to list databases on')
    .action(async (options) => {
        const spinner = ora('Listing databases');

        try {
            const server = await selectServer({
                spinner,
                canSelectWithoutLoggedIn: false,
                optionsObject: options,
            });

            if (!server) {
                throw new Error('No server selected');
            }

            const config = readConfig();
            const authToken = config.servers[server].auth.sessionId;

            if (!authToken) {
                throw new Error('Not logged in');
            }

            spinner.start('Listing databases...');

            const wrapper = Wrapper(server, authToken);

            const [res, err] = await wrapper.kv.list();

            if (err) {
                spinner.fail('Failed to list databases');
            } else {
                spinner.succeed('Fetched databases');

                let text = '';

                for (const db of res) {
                    text += `--------------------------------\n`;
                    text += `Name: ${chalk.bold(db.name)}\n`;
                    text += `ID: ${db.id}\n`;

                    const date = new Date(db.created_at).toUTCString();

                    text += `Created at: ${date}\n`;

                    text += 'Projects:\n';

                    for (const project of db.projects) {
                        text += `  - ${project.name}\n`;
                        text += `    ID: ${project.id}\n`;
                        text += `    Version: ${project.version}\n`;
                    }

                    if (db.projects.length === 0) {
                        text += '  - No projects\n';
                    }

                    text += `\n\n`;
                }

                if (text.length === 0) {
                    text = 'No databases found';
                    text +=
                        'You can create a new database with the command `yukactl kv create`';
                }

                console.log(text);
            }
        } catch (err) {
            let message = 'Failed to list databases';

            if (err instanceof Error) {
                message += `: ${err.message}`;
            }

            spinner.fail(message);
        }
    });

export const kv = new Command()
    .command('kv')
    .addCommand(create)
    .addCommand(list)
    .description('Manage yukako kv databases');
