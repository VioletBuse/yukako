import { Command } from 'commander';
import ora from 'ora';
import { readConfig } from '../util/main-config.js';
import { validateServerString } from './auth.js';
import { input, select } from '@inquirer/prompts';
import * as util from 'util';
import chalk from 'chalk';
import { ProjectTextBinding, readProjectFile } from '../util/yukakoproj.js';
import * as fs from 'fs-extra';
import path from 'path';
import {
    ProjectFolderFile,
    recursivelyReadFolder,
} from '../util/read-folder.js';
import { versions } from './versions.js';
import { NewProjectVersionRequestBodyType } from '@yukako/types/src/admin-api/projects/versions.js';
import { z } from 'zod';

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

            let server = options.server;

            if (
                !server ||
                typeof server !== 'string' ||
                !validateServerString(server)
            ) {
                server = await select({
                    message: 'Select a server to create the project on',
                    choices: Object.keys(servers).map((server) => ({
                        title: server,
                        value: server,
                    })),
                });
            }

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

            const response = await fetch(`${server}/api/projects`, {
                method: 'POST',
                headers: {
                    'auth-token': sessionId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                if (typeof result.error === 'string') {
                    spinner.fail(result.error);
                } else {
                    spinner.fail('Failed to create project');
                    throw new Error('Failed to create project');
                }
            } else {
                if (result.success === true && result.id) {
                    spinner.succeed(`Created project ${result.id}`);
                }
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

            let server = options.server;

            if (
                !server ||
                typeof server !== 'string' ||
                !validateServerString(server)
            ) {
                server = await select({
                    message: 'Select a server to list projects on',
                    choices: Object.keys(servers).map((server) => ({
                        title: server,
                        value: server,
                    })),
                });
            }

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

            const response = await fetch(`${server}/api/projects`, {
                method: 'GET',
                headers: {
                    'auth-token': sessionId,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                if (typeof result.error === 'string') {
                    spinner.fail(result.error);
                } else {
                    spinner.fail('Failed to list projects');
                    throw new Error('Failed to list projects');
                }
            } else {
                if (result) {
                    const chunks = result.map(
                        (project: {
                            id: string;
                            name: string;
                            latest_version: number | null;
                        }) => {
                            let str = '';
                            str += `${chalk.bold(project.name)}\n`;
                            str += `------------------------------\n`;
                            str += `ID: ${project.id}\n`;
                            str += `Latest version: ${
                                project.latest_version ?? 'none'
                            }\n`;

                            return str;
                        },
                    );

                    console.log('\n\n' + chunks.join('\n'));
                    spinner.succeed(`Listed projects on server ${server}`);
                }
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

            if (typeof server !== 'string') {
                server = await select({
                    message: 'Select a server to get project details from.',
                    choices: Object.keys(config.servers).map((server) => ({
                        title: server,
                        value: server,
                    })),
                });
            }

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
                const fetchProjectListSpinner = ora().start(
                    'Fetching Projects from server',
                );

                const projectsResponse = await fetch(`${server}/api/projects`, {
                    headers: {
                        'auth-token': auth_token,
                    },
                });

                if (!projectsResponse.ok) {
                    fetchProjectListSpinner.fail('Failed to get projects');
                    throw new Error('Failed to get projects');
                }

                const projects = await projectsResponse.json();

                fetchProjectListSpinner.succeed('Fetched projects');

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

            const projectResponse = await fetch(
                `${server}/api/projects/${id}`,
                {
                    headers: {
                        'auth-token': auth_token,
                    },
                },
            );

            const project = await projectResponse.json();

            if (!projectResponse.ok) {
                if (typeof project.error === 'string') {
                    spinner.fail(project.error);
                } else {
                    spinner.fail('Failed to get project details');
                    throw new Error('Failed to get project details');
                }
            } else {
                if (project) {
                    spinner.succeed(`Got project details for ${project.name}`);
                    // console.log(util.inspect(project, false, null, true));
                    const chunks = [
                        `${chalk.bold(project.name)}`,
                        `------------------------------`,
                        `ID: ${project.id}`,
                        `Latest version: ${project.latest_version ?? 'none'}`,
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
    .option('-s, --server <server>', 'Server to deploy the project to')
    .action(async (options) => {
        const spinner = ora('Deploying project');

        try {
            const projectfile = readProjectFile();
            const config = readConfig();

            let server = options.server;
            let id = options.id;

            if (
                (typeof server === 'string' && typeof id !== 'string') ||
                (typeof server !== 'string' && typeof id === 'string')
            ) {
                spinner.fail('You must specify both a server and a project ID');
                return;
            }

            let deployment: { id: string; server: string } | undefined =
                undefined;

            if (typeof server === 'string' && typeof id === 'string') {
                const deployments = projectfile.deployments;
                const _deployment = deployments.find(
                    (deployment) =>
                        deployment.id === id && deployment.server === server,
                );

                if (!_deployment) {
                    spinner.fail(
                        'There is no deployment in yukako.json with that ID and server',
                    );
                    spinner.info(
                        'Add a deployment to yukako.json with the correct ID and server',
                    );
                    spinner.info(
                        'Run $ yukactl projects list to see all projects on a specific server',
                    );
                    return;
                } else {
                    deployment = _deployment;
                }
            } else {
                const deploymentdata = await select({
                    message: 'Select a deployment to deploy',
                    choices: projectfile.deployments.map((deployment) => ({
                        name: `${deployment.name} -> ${deployment.server}`,
                        description: `Server: ${deployment.server}, id: ${deployment.id}`,
                        value: deployment,
                    })),
                });

                deployment = deploymentdata;
            }

            if (!deployment) {
                throw new Error('No deployment selected');
            }

            server = deployment.server;
            id = deployment.id;

            const sessionId = config.servers[deployment.server].auth.sessionId;

            if (!sessionId) {
                spinner.fail(
                    `You are not logged in to server ${deployment.server}`,
                );
                spinner.info(`Run '$ yukactl auth login' to log in`);
                return;
            }

            spinner.start('Deploying project...');

            const folder = path.resolve(process.cwd(), projectfile.folder);
            const entrypoint = path.resolve(folder, projectfile.entrypoint);

            // console.log(
            //     util.inspect(
            //         {
            //             folder,
            //             entrypoint,
            //         },
            //         false,
            //         null,
            //         true,
            //     ),
            // );

            const entrypointExists = await fs.pathExists(entrypoint);
            const entrypointWithinFolder = entrypoint.startsWith(folder);

            if (!entrypointExists) {
                spinner.fail('Entrypoint does not exist');
                return;
            }

            if (!entrypointWithinFolder) {
                spinner.fail('Entrypoint must be within the project folder');
                return;
            }

            // const contents = recursivelyReadFolder(folder);

            const entrypointfile = await fs.readFile(entrypoint, 'base64');

            const contents: ProjectFolderFile[] = [
                {
                    name: path.basename(entrypoint),
                    path: entrypoint,
                    base64: entrypointfile,
                    type: 'esmodule',
                },
            ];

            // console.log(util.inspect(deployment, false, null, true));
            // console.log(util.inspect(contents, false, null, true));

            const entrypointFile = contents.find(
                (file) => file.path === entrypoint,
            );

            if (!entrypointFile) {
                spinner.fail('Entrypoint not found within project folder');
                return;
            }

            const contentsWithEntrypointFirst = [
                entrypointFile,
                ...contents.filter((file) => file.path !== entrypoint),
            ];

            // console.log(
            //     util.inspect(contentsWithEntrypointFirst, false, null, true),
            // );

            const projectResponse = await fetch(
                `${server}/api/projects/${id}`,
                {
                    headers: { 'auth-token': sessionId },
                },
            );

            if (!projectResponse.ok) {
                if (projectResponse.status === 404) {
                    spinner.fail('Project not found');
                    return;
                } else {
                    const data = await projectResponse.json();
                    if (typeof data.error === 'string') {
                        spinner.fail(data.error);
                        throw new Error('Failed to get project.');
                    } else {
                        spinner.fail('Failed to get project');
                        throw new Error('Failed to get project.');
                    }
                }
            }

            const textBindings = projectfile.text_bindings.map((binding) => {
                if ('value' in binding) {
                    return {
                        name: binding.name,
                        value: binding.value,
                    };
                } else {
                    const contents = fs.readFileSync(
                        path.join(folder, binding.file),
                        'utf-8',
                    );
                    return {
                        name: binding.name,
                        value: contents,
                    };
                }
            });

            const jsonBindings = projectfile.json_bindings.map((binding) => {
                if ('value' in binding) {
                    return {
                        name: binding.name,
                        value: binding.value,
                    };
                } else {
                    const contents = fs.readJSONSync(
                        path.join(folder, binding.file),
                        { throws: false },
                    );

                    if (contents === null) {
                        throw new Error(
                            `Failed to read JSON file ${binding.file} to bind to ${binding.name}`,
                        );
                    }

                    return {
                        name: binding.name,
                        value: contents,
                    };
                }
            });

            const dataBindings = projectfile.data_bindings.map((binding) => {
                if ('base64' in binding) {
                    return {
                        name: binding.name,
                        base64: binding.base64,
                    };
                } else {
                    const contents = fs.readFileSync(
                        path.join(folder, binding.file),
                        'base64',
                    );
                    return {
                        name: binding.name,
                        base64: contents,
                    };
                }
            });

            const newVersionData: NewProjectVersionRequestBodyType = {
                blobs: contentsWithEntrypointFirst.map((file) => ({
                    filename: file.name,
                    type: file.type,
                    data: file.base64,
                })),
                routes: projectfile.routes.map((route) => ({
                    host: route.host,
                    basePaths: route.paths,
                })),
                textBindings: textBindings,
                jsonBindings: jsonBindings,
                dataBindings: dataBindings,
            };

            const newVersionResult = await fetch(
                `${server}/api/projects/${id}/versions`,
                {
                    method: 'POST',
                    headers: {
                        'auth-token': sessionId,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newVersionData),
                },
            );

            const newVersion = await newVersionResult.json();

            if (!newVersionResult.ok) {
                if (typeof newVersion.error === 'string') {
                    spinner.fail(newVersion.error);
                } else {
                    spinner.fail('Failed to create new version');
                    throw new Error('Failed to create new version');
                }
            } else {
                if (newVersion.version) {
                    spinner.succeed(`Created version ${newVersion.version}`);
                } else {
                    spinner.fail('Failed to create new version');
                    console.log('Response:');
                    console.log(util.inspect(newVersion, false, null, true));
                    throw new Error('Failed to create new version');
                }
            }

            spinner.succeed('Deployed project');
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
