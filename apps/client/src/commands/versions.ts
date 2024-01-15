import { Command } from 'commander';
import { readConfig } from '../util/main-config.js';
import ora from 'ora';
import { input, select } from '@inquirer/prompts';
import * as util from 'util';
import chalk from 'chalk';

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
                server = await select({
                    message: 'Select a server',
                    choices: Object.keys(config.servers).map((key) => {
                        return {
                            name: key,
                            value: key,
                        };
                    }),
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

                const projectsResponse = await fetch(`${server}/projects`, {
                    headers: {
                        'auth-token': authToken,
                    },
                });

                if (!projectsResponse.ok) {
                    throw new Error('Failed to fetch list of projects');
                } else {
                    spinner.succeed('Fetched list of projects');

                    const projects = await projectsResponse.json();

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

                const projectDetailsResponse = await fetch(
                    `${server}/projects/${id}`,
                    {
                        headers: {
                            'auth-token': authToken,
                        },
                    },
                );

                let latestVersion: number;

                if (!projectDetailsResponse.ok) {
                    throw new Error('Failed to fetch project details');
                } else {
                    spinner.succeed('Fetched project details');

                    const projectDetails = await projectDetailsResponse.json();

                    if (!('latest_version' in projectDetails)) {
                        throw new Error('Failed to fetch project details');
                    }

                    if (projectDetails.latest_version === null) {
                        throw new Error(
                            'No versions found. Use `$ yukactl projects deploy` to deploy a project version.',
                        );
                    }

                    if (typeof projectDetails.latest_version !== 'number') {
                        throw new Error('Failed to fetch project details');
                    }

                    latestVersion = projectDetails.latest_version;
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
                const sessionId = config.servers[server].auth.sessionId;

                if (typeof sessionId !== 'string') {
                    throw new Error(
                        'Session ID not found. Use `$ yukactl auth login` to login to the server',
                    );
                }

                authToken = sessionId;
            }

            spinner.start('Fetching version details');

            const versionDetailRequest = await fetch(
                `${server}/projects/${id}/versions/find-by-version/${version}`,
                {
                    headers: {
                        'auth-token': authToken,
                    },
                },
            );

            if (!versionDetailRequest.ok) {
                if (versionDetailRequest.status === 404) {
                    throw new Error('Version not found');
                } else {
                    const data = await versionDetailRequest.json();

                    if ('error' in data && typeof data.error === 'string') {
                        throw new Error(data.error);
                    } else {
                        throw new Error('Failed to fetch version details');
                    }
                }
            } else {
                spinner.succeed('Fetched version details');

                const versionDetails = await versionDetailRequest.json();

                const id = versionDetails.id;
                const version = versionDetails.version;

                const chunks = [
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
                    chunks.push(`    chunk-type: ${chalk(blob.type)}`);
                }

                // console.log(
                //     util.inspect(
                //         versionDetails,
                //         false,
                //         null,
                //         true /* enable colors */,
                //     ) + '\n',
                // );

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
