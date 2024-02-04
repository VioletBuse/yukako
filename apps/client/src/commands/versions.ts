import { Command } from 'commander';
import { readConfig } from '../util/main-config.js';
import ora from 'ora';
import { input, select } from '@inquirer/prompts';
import * as util from 'util';
import chalk from 'chalk';
import { ProjectVersionsDataResponseBodyType } from '@yukako/types/src/admin-api/projects/versions.js';
import { selectServer } from '../util/server-select.js';
import { Wrapper } from '@yukako/wrapper';

const details = new Command()
    .command('details')
    .description('Show details of a version')
    .option('-s, --server <server>', 'Server to use')
    .option('-i, --id <id>', 'Project ID')
    .option('-v, --version <version>', 'Version')
    .action(async (options) => {
        const spinner = ora('Loading project details');

        try {
            let server = options.server;
            let id = options.id;
            let version = options.version;

            const config = readConfig();

            const allOptionsAreSet =
                typeof server === 'string' &&
                typeof id === 'string' &&
                typeof version === 'string';
            const noOptionsAreSet =
                typeof server !== 'string' &&
                typeof id !== 'string' &&
                typeof version !== 'string';

            if (!allOptionsAreSet && !noOptionsAreSet) {
                throw new Error('You must set all options or none');
            }

            let authToken: string;

            if (noOptionsAreSet) {
                server = await selectServer({
                    canSelectWithoutLoggedIn: false,
                    serverOption: server,
                });

                if (typeof server !== 'string') {
                    throw new Error('You must select a server');
                }

                const sessionId = config.servers[server].auth.sessionId;

                if (typeof sessionId !== 'string') {
                    throw new Error(
                        'Session ID not found. Use `$ yukactl auth login` to login to the server',
                    );
                }

                authToken = sessionId;

                spinner.start('Fetching list of projects.');

                // const projectsResponse = await fetch(`${server}/api/projects`, {
                //     headers: {
                //         'auth-token': authToken,
                //     },
                // });

                const wrapper = Wrapper(server, authToken);
                const [projectsResponse, err] = await wrapper.projects.list();

                // if (!projectsResponse.ok) {
                //     throw new Error('Failed to fetch list of projects');
                // } else {
                //     spinner.succeed('Fetched list of projects');
                //
                //     const projects = await projectsResponse.json();
                //
                //     id = await select({
                //         message: 'Select a project',
                //         choices: projects.map(
                //             (project: { id: string; name: string }) => {
                //                 return {
                //                     name: project.name,
                //                     value: project.id,
                //                 };
                //             },
                //         ),
                //     });
                //
                //     if (typeof id !== 'string') {
                //         throw new Error('You must select a project');
                //     }
                // }

                if (err) {
                    throw new Error(err);
                } else {
                    spinner.succeed('Fetched list of projects');

                    const projects = projectsResponse;

                    id = await select({
                        message: 'Select a project',
                        choices: projects.map(
                            (project: { id: string; name: string }) => {
                                return {
                                    name: project.name,
                                    value: project.id,
                                };
                            },
                        ),
                    });

                    if (typeof id !== 'string') {
                        throw new Error('You must select a project');
                    }
                }

                spinner.start('Fetching project details');

                const [projectDetails, errFetchingProject] =
                    await wrapper.projects.getById(id);

                let latestVersion: number;

                if (errFetchingProject) {
                    throw new Error('Failed to fetch project details');
                } else {
                    spinner.succeed('Fetched project details');

                    if (!projectDetails?.latest_version) {
                        throw new Error('Project has no deployed versions.');
                    }

                    latestVersion = projectDetails?.latest_version;
                }

                version = await input({
                    message:
                        'Enter a version between 1 and ' +
                        latestVersion.toString(),
                    validate: (input) => {
                        const versionNumber = parseInt(input);

                        if (isNaN(versionNumber)) {
                            return 'Version must be a number';
                        }

                        if (
                            versionNumber < 1 ||
                            versionNumber > latestVersion
                        ) {
                            return (
                                'Version must be between 1 and ' +
                                latestVersion.toString()
                            );
                        }

                        return true;
                    },
                });
            } else {
                server = await selectServer({
                    canSelectWithoutLoggedIn: false,
                    serverOption: server,
                });

                if (typeof server !== 'string') {
                    throw new Error('You must select a server');
                }

                const sessionId = config.servers[server].auth.sessionId;

                if (typeof sessionId !== 'string') {
                    throw new Error(
                        'Session ID not found. Use `$ yukactl auth login` to login to the server',
                    );
                }

                authToken = sessionId;
            }

            spinner.start('Fetching version details');

            const wrapper = Wrapper(server, authToken);
            const [res, err] = await wrapper.projects.versions.findByVersion(
                id,
                version,
            );

            if (err) {
                throw new Error(err);
            } else {
                spinner.succeed('Fetched version details');
                const versionDetails: ProjectVersionsDataResponseBodyType = res;

                const id = versionDetails.id;
                const version = versionDetails.version;

                const chunks = [
                    ``,
                    `----------------------------------------`,
                    `Project Details:`,
                    `----------------------------------------`,
                    `Id: ${chalk.bold(id)}`,
                    `Version: ${chalk.bold(version)}`,
                    `Project Id: ${chalk.bold(versionDetails.projectId)}`,
                    `----------------------------------------`,
                    ``,
                    `Routes:`,
                ];

                for (const route of versionDetails.routes) {
                    chunks.push(`  ${chalk.bold(route.host)}`);
                    for (const basePath of route.basePaths) {
                        chunks.push(`    ${basePath}`);
                    }
                }

                chunks.push(``);
                chunks.push(`----------------------------------------`);
                chunks.push(``);
                chunks.push(`Blobs:`);

                for (const blob of versionDetails.blobs) {
                    chunks.push(`  ${chalk.bold(blob.filename)}`);
                    chunks.push(`    id: ${chalk(blob.id)}`);
                    chunks.push(`    file-type: ${chalk(blob.type)}`);
                }

                if (
                    versionDetails.textBindings.length > 0 ||
                    versionDetails.jsonBindings.length > 0 ||
                    versionDetails.dataBindings.length > 0
                ) {
                    chunks.push(``);
                    chunks.push(`----------------------------------------`);
                    chunks.push(``);
                    chunks.push(`Bindings:`);

                    for (const binding of versionDetails.textBindings) {
                        chunks.push(`  ${chalk.bold(binding.name)}`);
                        chunks.push(`    value: ${chalk(binding.value)}`);
                    }

                    chunks.push(``);

                    for (const binding of versionDetails.jsonBindings) {
                        chunks.push(`  ${chalk.bold(binding.name)}`);
                        chunks.push(
                            `    value: ${chalk(util.inspect(binding.value))}`,
                        );
                    }

                    chunks.push(``);

                    for (const binding of versionDetails.dataBindings) {
                        chunks.push(`  ${chalk.bold(binding.name)}`);
                        chunks.push(`    value: ${chalk(binding.base64)}`);
                    }
                }

                console.log(chunks.join('\n'));
            }
        } catch (err) {
            let message: string;

            if (err instanceof Error) {
                message = err.message;
            } else {
                message = 'An unknown error occurred';
            }

            spinner.fail(message);
            console.error(err);
        }
    });

export const versions = new Command()
    .command('versions')
    .description('Manage project versions')
    .addCommand(details);
