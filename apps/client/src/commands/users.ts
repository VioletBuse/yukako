import { Command } from 'commander';
import ora from 'ora';
import { selectServer } from '../util/server-select.js';
import { Wrapper } from '@yukako/wrapper';
import { readConfig } from '../util/main-config.js';
import * as util from 'util';

const list = new Command()
    .command('list')
    .option('-s, --server <server>', 'Server to use')
    .action(async (options) => {
        const spinner = ora('Loading user list');

        try {
            const server = await selectServer({
                canSelectWithoutLoggedIn: false,
                serverOption: options.server,
                spinner,
            });

            if (typeof server !== 'string') {
                throw new Error('You must select a server');
            }

            const config = readConfig();
            const sessionId = config.servers[server].auth.sessionId;

            if (typeof sessionId !== 'string') {
                throw new Error(
                    'Session ID not found. Use `$ yukactl auth login` to login to the server',
                );
            }

            const wrapper = Wrapper(server, sessionId);

            spinner.start();

            const [users, error] = await wrapper.users.list();

            if (users === null) {
                spinner.fail(error);
                process.exit(1);
            } else {
                spinner.succeed('User list loaded');
                // console.log(util.inspect(users, false, null, true));

                let chunks = [];

                for (let i = 0; i < users.length; i++) {
                    chunks.push('-----------------------------------');
                    chunks.push('ID: ' + users[i].uid);
                    chunks.push('Username: ' + users[i].username);

                    const invitedBy = users[i].invitedBy;

                    if (invitedBy !== null) {
                        chunks.push(
                            `Invited by: ${invitedBy.username} (${invitedBy.uid})`,
                        );
                    }

                    if (users[i].invitees.length > 0) {
                        chunks.push('Invitees:');
                        for (let j = 0; j < users[i].invitees.length; j++) {
                            chunks.push(
                                `  ${users[i].invitees[j].username} (${users[i].invitees[j].uid})`,
                            );
                        }
                    }

                    chunks.push(' ');
                }

                console.log(chunks.join('\n'));
            }
        } catch (err) {
            let message: string;

            if (err instanceof Error) {
                message = err.message;
            } else {
                message = 'An unexpected error occurred';
            }

            spinner.fail(message);
            console.error(err);
        }
    });

export const users = new Command()
    .command('users')
    .description('Manage yukako users')
    .addCommand(list);
