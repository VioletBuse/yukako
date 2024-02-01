import { Command } from 'commander';
import { input, password, select, confirm } from '@inquirer/prompts';
import { z } from 'zod';
import ora from 'ora';
import { readConfig, writeConfig } from '../util/main-config.js';
import * as util from 'util';
import { produce } from 'immer';
import chalk from 'chalk';
import { validateServerString, selectServer } from '../util/server-select.js';
import { Wrapper } from '@yukako/wrapper';

export const login = new Command()
    .command('login')
    .description('Login to a Yukako Instance')
    .option('-s, --server <server>', 'The server to log in to')
    .option('-u, --username <username>', 'The username to log in with')
    .option('-p, --password <password>', 'The password to log in with')
    .action(async (options) => {
        const loginSpinner = ora('Logging in...');

        try {
            const server = await selectServer({
                canSelectWithoutLoggedIn: true,
                spinner: loginSpinner,
                serverOption: options.server,
            });

            if (!server) {
                loginSpinner.fail('No server selected');
                process.exit(1);
            }

            let username = options.username;

            if (!username || typeof username !== 'string') {
                username = await input({
                    message: 'Enter your username',
                });
            }

            let pass = options.password;

            if (!pass || typeof pass !== 'string') {
                pass = await password({
                    message: 'Enter your password',
                    mask: true,
                });
            }

            const wrapper = Wrapper(server);

            loginSpinner.start('Logging in...');

            const [res, err] = await wrapper.auth.login({
                username,
                password: pass,
            });

            if (!res) {
                loginSpinner.fail(err);
            } else {
                const sessionId = res.sessionId;

                const config = readConfig();
                const newConfig = produce(config, (draft) => {
                    if (draft.servers[server]) {
                        draft.servers[server].auth.sessionId = sessionId;
                    } else {
                        draft.servers[server] = {
                            auth: {
                                sessionId,
                            },
                        };
                    }
                });

                writeConfig(newConfig);

                loginSpinner.succeed('Logged in successfully');
            }
        } catch (err) {
            loginSpinner.fail('Unknown error');
            console.error(err);
        }
    });
const register = new Command()
    .command('register')
    .description('Register a new user')
    .option('-s, --server <server>', 'The server to register on')
    .option('-u, --username <username>', 'The username to register with')
    .option('-p, --password <password>', 'The password to register with')
    .option(
        '-t, --new-user-token <token>',
        'The new user token to register with',
    )
    .action(async (options) => {
        const registerSpinner = ora('Registering...');

        try {
            const server = await selectServer({
                canSelectWithoutLoggedIn: true,
                spinner: registerSpinner,
                serverOption: options.server,
            });

            if (!server) {
                registerSpinner.fail('No server selected');
                process.exit(1);
            }

            let username = options.username;

            if (!username || typeof username !== 'string') {
                username = await input({
                    message: 'Enter your username',
                });
            }

            let pass = options.password;

            if (!pass || typeof pass !== 'string') {
                pass = await password({
                    message: 'Enter your password',
                    mask: true,
                });
            }

            let confirmPass = options.password;

            if (!confirmPass || typeof confirmPass !== 'string') {
                confirmPass = await password({
                    message: 'Confirm your password',
                    mask: true,
                });
            }

            if (pass !== confirmPass) {
                registerSpinner.fail('Passwords do not match');
                process.exit(1);
            }

            let newUserToken = options.newUserToken;

            if (!newUserToken || typeof newUserToken !== 'string') {
                const hasToken = await confirm({
                    message:
                        'Do you have a new user token? You need this if you are not the first user.',
                });

                if (hasToken) {
                    newUserToken = await input({
                        message: 'Enter your new user token',
                    });
                } else {
                    newUserToken = null;
                }
            }

            registerSpinner.start('Registering...');

            const wrapper = Wrapper(server);

            const [res, err] = await wrapper.auth.register({
                username,
                password: pass,
                newUserToken,
            });

            if (!res) {
                registerSpinner.fail(err);
            } else {
                const sessionId = res.sessionId;

                const config = readConfig();
                const newConfig = produce(config, (draft) => {
                    if (draft.servers[server]) {
                        draft.servers[server].auth.sessionId = sessionId;
                    } else {
                        draft.servers[server] = {
                            auth: {
                                sessionId,
                            },
                        };
                    }
                });

                writeConfig(newConfig);

                registerSpinner.succeed('Registered successfully');
            }
        } catch (err) {
            registerSpinner.fail('Unknown error');
            console.error(err);
        }
    });

const logout = new Command()
    .command('logout')
    .description('Logout from a Yukako Instance')
    .option('-s, --server <server>', 'The server to log out from')
    .action(async (options) => {
        try {
            const config = readConfig();
            const servers = config.servers;

            const server = await selectServer({
                canSelectWithoutLoggedIn: true,
                serverOption: options.server,
            });

            if (!server) {
                console.error('No server selected');
                process.exit(1);
            }

            if (!servers[server]) {
                console.error(`Server ${server} not found`);
                process.exit(1);
            }

            const newConfig = produce(config, (draft) => {
                draft.servers[server].auth.sessionId = null;
            });

            writeConfig(newConfig);

            console.log(`Logged out of ${server}`);
        } catch (err) {
            console.error(err);
        }
    });

const generateNewUserToken = new Command()
    .command('new-token')
    .description('Generate a new user token')
    .option(
        '-s, --server <server>',
        'The server to generate a new user token on',
    )
    .action(async (options) => {
        const newTokenSpinner = ora('Generating new user token...');

        try {
            const config = readConfig();
            const servers = config.servers;

            const server = await selectServer({
                canSelectWithoutLoggedIn: false,
                serverOption: options.server,
            });

            if (!server) {
                newTokenSpinner.fail('No server selected');
                process.exit(1);
            }

            newTokenSpinner.start('Generating new user token...');

            if (!servers[server]) {
                newTokenSpinner.fail(`Server ${server} not found`);
                process.exit(1);
            }

            const sessionId = servers[server].auth.sessionId;

            if (!sessionId) {
                newTokenSpinner.fail(`No session ID found for ${server}`);
                process.exit(1);
            }

            const wrapper = Wrapper(server, sessionId);

            const [res, err] = await wrapper.auth.createNewUserToken();

            if (!res) {
                newTokenSpinner.fail(err);
            } else {
                const newUserToken = res.token;

                newTokenSpinner.succeed(
                    `New user token: ${chalk.bold(newUserToken)}`,
                );
            }
        } catch (err) {
            newTokenSpinner.fail('Unknown error');
            console.error(err);
        }
    });

const whoami = new Command()
    .command('whoami')
    .description('Display the current user')
    .option('-s, --server <server>', 'The server to check the current user on')
    .action(async (options) => {
        const server = await selectServer({
            canSelectWithoutLoggedIn: true,
            serverOption: options.server,
        });

        if (!server) {
            console.error('No server selected');
            process.exit(1);
        }

        const config = readConfig();
        const servers = config.servers;

        if (!servers[server]) {
            console.error(`Server ${server} not found`);
            process.exit(1);
        }

        const sessionId = servers[server].auth.sessionId;

        if (!sessionId) {
            console.error(`No session ID found for ${server}`);
            process.exit(1);
        }

        const wrapper = Wrapper(server, sessionId);

        const [res, err] = await wrapper.auth.me();

        if (!res) {
            console.error(err);
        } else {
            const { username, uid } = res;

            console.log(`Logged in as ${username} (uid: ${uid})`);
        }
    });

export const auth = new Command()
    .command('auth')
    .description('Manage authentication for Yukako Instances')
    .addCommand(login)
    .addCommand(register)
    .addCommand(logout)
    .addCommand(generateNewUserToken)
    .addCommand(whoami);
