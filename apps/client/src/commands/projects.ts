import { Command } from 'commander';
import ora from 'ora';
import { readConfig } from '../util/main-config.js';
import { input, select } from '@inquirer/prompts';
import * as util from 'util';
import chalk from 'chalk';
import {
    configToVersionPush,
    getConfig,
    getDeployments,
} from '../util/yukakoproj.js';
import * as fs from 'fs-extra';
import path from 'path';
import {
    ProjectFolderFile,
    recursivelyReadFolder,
} from '../util/read-folder.js';
import { versions } from './versions.js';
import { NewProjectVersionRequestBodyType } from '@yukako/types/src/admin-api/projects/versions.js';
import { z } from 'zod';
import { selectServer, validateServerString } from '../util/server-select.js';
import { Wrapper } from '@yukako/wrapper';

const create = new Command()
    .command('create')
    .description('Create a project on the server')
    .option('-s, --server <server>', 'Server to create the project on')
    .option('-n, --name <name>', 'Name of the project')
    .action(async (options) => {
        const spinner = ora('Creating project');
        try {
            const config = readConfig();
            const servers = config.servers;

            const server = await selectServer({
                canSelectWithoutLoggedIn: false,
                serverOption: options.server,
            });

            if (!server || !servers[server]) {
                throw new Error('No server selected');
            }

            const sessionId = servers[server].auth.sessionId;

            if (!sessionId) {
                spinner.fail(`You are not logged in to server ${server}`);
                spinner.info(`Run '$ yukactl auth login' to log in`);
                return;
            }

            let name = options.name;

            if (!name || typeof name !== 'string') {
                name = await input({
                    message: 'Enter the name of the project',
                });
            }

            if (!name) {
                throw new Error('No project name entered');
            }

            spinner.start('Creating project...');

            const wrapper = Wrapper(server, sessionId);

            const [res, err] = await wrapper.projects.create(name);

            if (!res) {
                spinner.fail('Failed to create project');
            } else {
                spinner.succeed(`Created project ${name} (id: ${res.id})`);
            }
        } catch (error) {
            spinner.fail('Failed to create project');
            console.error(error);
        }
    });

const list = new Command()
    .command('list')
    .description('List all projects on the server')
    .option('-s, --server <server>', 'Server to list projects on')
    .action(async (options) => {
        const spinner = ora('Listing projects');

        try {
            const config = readConfig();
            const servers = config.servers;

            const server = await selectServer({
                canSelectWithoutLoggedIn: false,
                serverOption: options.server,
            });

            if (!server || !servers[server]) {
                throw new Error('No server selected');
            }

            const sessionId = servers[server].auth.sessionId;

            if (!sessionId) {
                spinner.fail(`You are not logged in to server ${server}`);
                spinner.info(`Run '$ yukactl auth login' to log in`);
                return;
            }

            spinner.start('Listing projects...');

            const wrapper = Wrapper(server, sessionId);

            const [res, err] = await wrapper.projects.list();

            if (res === null) {
                spinner.fail('Failed to list projects');
            } else {
                const chunks = res.map(
                    (project: {
                        id: string;
                        name: string;
                        latest_version: { id: string; version: number } | null;
                    }) => {
                        let str = '';
                        str += `${chalk.bold(project.name)}\n`;
                        str += `------------------------------\n`;
                        str += `ID: ${project.id}\n`;
                        str += `Latest version: ${
                            project.latest_version
                                ? project.latest_version.version
                                : 'Not deployed'
                        }\n`;

                        return str;
                    },
                );

                console.log('\n\n' + chunks.join('\n'));
                spinner.succeed(`Listed projects on server ${server}`);
            }
        } catch (error) {
            spinner.fail('Failed to list projects');
            console.error(error);
        }
    });

const details = new Command()
    .command('details')
    .description('Get details about a project')
    .option('-s, --server <server>', 'Server to get project details from')
    .option('-i, --id <id>', 'ID of the project to get details about')
    .action(async (options) => {
        const spinner = ora('Getting project details');

        try {
            const config = readConfig();

            let server = options.server;
            let id = options.id;

            if (typeof id === 'string' && typeof server !== 'string') {
                spinner.fail(
                    'If you specify a project id, you must also specify a server',
                );
                return;
            }

            server = await selectServer({
                canSelectWithoutLoggedIn: false,
                serverOption: server,
            });

            if (!server) {
                throw new Error('No server selected');
            }

            if (!config.servers[server]) {
                throw new Error('You are not logged in to that server.');
            }

            const auth_token = config.servers[server].auth.sessionId;

            if (!auth_token) {
                throw new Error('You are not logged in to that server.');
            }

            if (typeof id !== 'string') {
                // const fetchProjectListSpinner = ora().start(
                //     'Fetching Projects from server',
                // );

                spinner.start('Fetching Projects from server');

                const [projects, err] = await Wrapper(
                    server,
                    auth_token,
                ).projects.list();

                if (projects === null) {
                    spinner.fail('Failed to get projects');
                    throw new Error('Failed to get projects');
                } else {
                    spinner.succeed('Got projects');
                }

                const project = await select({
                    message: 'Select a project to get details about',
                    choices: projects.map(
                        (project: { id: string; name: string }) => ({
                            name: project.name,
                            value: project.id,
                        }),
                    ),
                });

                if (!project) {
                    throw new Error('No project selected');
                }

                id = project;
            }

            spinner.start('Getting project details...');

            const wrapper = Wrapper(server, auth_token);
            const [project, err] = await wrapper.projects.getById(id);

            spinner.stop();

            if (err) {
                spinner.fail('Failed to get project details');
            } else {
                if (project) {
                    spinner.succeed(`Got project details for ${project.name}`);

                    const versionStrings = project.latest_version
                        ? [
                              `	ID: ${project.latest_version.id}`,
                              `	Version: ${project.latest_version.version}`,
                              `	Created at: ${new Date(
                                  project.latest_version.created_at,
                              ).toUTCString()}`,
                          ]
                        : ['	Project is not deployed yet'];

                    const chunks = [
                        `${chalk.bold(project.name)}`,
                        `------------------------------`,
                        `ID: ${project.id}`,
                        `Latest version:`,
                        ...versionStrings,
                        ``,
                        `Created at: ${new Date(
                            project.created_at,
                        ).toUTCString()}`,
                    ];
                    console.log('\n\n' + chunks.join('\n'));
                }
            }
        } catch (error) {
            spinner.fail('Failed to get project details');
            console.error(error);
        }
    });

const deploy = new Command()
    .command('deploy')
    .description('Deploy the project to the server')
    .option('-i, --id <id>', 'ID of the project to deploy')
    .action(async (options) => {
        const spinner = ora('Deploying project');

        try {
            const deployments = getDeployments();

            if (deployments.length === 0) {
                spinner.fail('No deployments found in yukako project file.');
            }

            let deployment: (typeof deployments)[number] | undefined =
                undefined;

            if (options && 'id' in options && typeof options.id === 'string') {
                const _deployment = deployments.find(
                    (deployment) => deployment.id === options.id,
                );

                if (_deployment) {
                    deployment = _deployment;
                } else {
                    throw new Error('No deployment found with that ID');
                }
            }

            if (!deployment) {
                if (deployments.length === 1) {
                    deployment = deployments[0];
                } else {
                    deployment = await select({
                        message: 'Select a deployment to deploy',
                        choices: deployments.map((deployment) => ({
                            name: `${deployment.name} -> ${deployment.server}`,
                            value: deployment,
                        })),
                    });
                }
            }

            if (!deployment) {
                spinner.fail('No deployment selected');
            }

            const authConfig = readConfig();

            const server = deployment.server;

            const sessionId = authConfig.servers[server]?.auth?.sessionId;

            if (!sessionId) {
                spinner.fail('You are not logged in to server');
                spinner.info(`Run '$ yukactl auth login' to log in`);
                return;
            }

            const wrapper = Wrapper(server, sessionId);

            spinner.start('Checking login status...');

            const [, err] = await wrapper.auth.me();

            if (err) {
                spinner.fail('Failed to check login status');
                console.error(err);
                return;
            } else {
                spinner.succeed('Logged in');
            }

            spinner.start('Checking that project exists...');

            const [, errFetchingProject] = await wrapper.projects.getById(
                deployment.id,
            );

            if (errFetchingProject) {
                spinner.fail('Failed to get project');
                console.error(errFetchingProject);
                return;
            } else {
                spinner.succeed('Got project');
            }

            try {
                spinner.start('Deploying project...');
                const projectDeploymentConfig = getConfig(deployment.id);

                const versionPushData = await configToVersionPush(
                    projectDeploymentConfig,
                );

                const [res, err] = await wrapper.projects.versions.new(
                    deployment.id,
                    versionPushData,
                );

                if (!res) {
                    spinner.fail('Failed to deploy project');
                    console.error(err);
                } else {
                    spinner.succeed(
                        `Deployed V${res.version} project ${deployment.id}`,
                    );
                }
            } catch (error) {
                let message = 'Failed to deploy project';

                if (error instanceof Error) {
                    message = error.message;
                }

                spinner.fail(message);
            }
        } catch (err) {
            spinner.fail('Failed to deploy project');
            console.error(err);
        }
    });

export const projects = new Command()
    .command('projects')
    .addCommand(list)
    .addCommand(create)
    .addCommand(details)
    .addCommand(deploy)
    .addCommand(versions)
    .description('Manage Yukako projects');
