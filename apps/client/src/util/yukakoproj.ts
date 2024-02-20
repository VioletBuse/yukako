import * as fs from 'fs-extra';
import * as path from 'path';
import * as esbuild from 'esbuild';
import { parse as yamlParse } from 'yaml';
import { parse as tomlParse } from 'toml';
import { z } from 'zod';
import { NewProjectVersionRequestBodyType } from '@yukako/types/src/admin-api/projects/versions.ts';
import * as util from 'util';

const baseConfigSchema = z.object({
    folder: z.string(),
    entrypoint: z.string(),

    routes: z.array(
        z.object({
            host: z.string(),
            paths: z.array(z.string()),
        }),
    ),

    text_bindings: z
        .array(
            z.union([
                z.object({
                    name: z.string(),
                    value: z.string(),
                }),
                z.object({
                    name: z.string(),
                    file: z.string(),
                }),
            ]),
        )
        .optional(),

    json_bindings: z
        .array(
            z.union([
                z.object({
                    name: z.string(),
                    value: z.union([
                        z.string(),
                        z.number(),
                        z.boolean(),
                        z.null(),
                        z.array(z.any()),
                        z.record(z.any()),
                    ]),
                }),
                z.object({
                    name: z.string(),
                    file: z.string(),
                }),
            ]),
        )
        .optional(),

    data_bindings: z
        .array(
            z.union([
                z.object({
                    name: z.string(),
                    base64: z.string(),
                }),
                z.object({
                    name: z.string(),
                    file: z.string(),
                }),
            ]),
        )
        .optional(),

    kv_bindings: z
        .array(
            z.object({
                name: z.string(),
                kv_database_id: z.string(),
            }),
        )
        .optional(),

    sites: z
        .array(
            z.object({
                name: z.string(),
                folder: z.string(),
            }),
        )
        .optional(),
});

const baseDeploymentSchema = z.object({
    server: z.string(),
    name: z.string(),
    id: z.string(),
});

const deploymentSchema = baseDeploymentSchema.merge(baseConfigSchema.partial());

const deploymentFileSchema = z.object({
    deployments: z.array(deploymentSchema),
});

const configFileSchema = baseConfigSchema.merge(deploymentFileSchema);

export const findAndParseFile = (): unknown => {
    const dir = process.cwd();

    const jsonProjectFile = path.join(dir, 'yukako.json');
    const yamlProjectFile = path.join(dir, 'yukako.yaml');
    const ymlProjectFile = path.join(dir, 'yukako.yml');
    const tomlProjectFile = path.join(dir, 'yukako.toml');

    try {
        if (fs.existsSync(jsonProjectFile)) {
            return fs.readJSONSync(jsonProjectFile);
        }

        if (fs.existsSync(yamlProjectFile)) {
            const fileContents = fs.readFileSync(yamlProjectFile, 'utf8');
            return yamlParse(fileContents);
        }

        if (fs.existsSync(ymlProjectFile)) {
            const fileContents = fs.readFileSync(ymlProjectFile, 'utf8');
            return yamlParse(fileContents);
        }

        if (fs.existsSync(tomlProjectFile)) {
            const fileContents = fs.readFileSync(tomlProjectFile, 'utf8');
            return tomlParse(fileContents);
        }

        throw new Error('Project file does not exist or could not be parsed.');
    } catch (err) {
        throw new Error('Project file does not exist or could not be parsed.');
    }
};

export const getDeployments = () => {
    const project = findAndParseFile();

    const parseResult = deploymentFileSchema.safeParse(project);

    if (!parseResult.success) {
        throw parseResult.error;
    }

    return parseResult.data.deployments;
};

export const getConfig = (
    deploymentid: string,
): z.infer<typeof baseConfigSchema> => {
    const project = findAndParseFile();

    const parseResult = configFileSchema.safeParse(project);

    if (!parseResult.success) {
        throw parseResult.error;
    }

    const { deployments, ...config } = parseResult.data;

    const deployment = deployments.find((d: any) => d.id === deploymentid);

    if (!deployment) {
        throw new Error('Deployment not found');
    }

    const { server, name, id, ...rest } = deployment;

    return { ...config, ...rest };
};

const resolveTextBindings = (
    config: z.infer<typeof baseConfigSchema>,
    folder: string,
): NewProjectVersionRequestBodyType['textBindings'] => {
    const textBindings: NewProjectVersionRequestBodyType['textBindings'] =
        config.text_bindings?.map((binding) => {
            if ('value' in binding) {
                return {
                    name: binding.name,
                    value: binding.value,
                };
            } else {
                const file = path.resolve(folder, binding.file);

                if (!fs.existsSync(file)) {
                    throw new Error(
                        `File for text binding ${binding.name} does not exist`,
                    );
                }
                try {
                    const contents = fs.readFileSync(file, 'utf-8');

                    return {
                        name: binding.name,
                        value: contents,
                    };
                } catch (e) {
                    throw new Error(
                        `File for text binding ${binding.name} does not exist`,
                    );
                }
            }
        }) ?? [];

    return textBindings;
};

const resolveJsonBindings = (
    config: z.infer<typeof baseConfigSchema>,
    folder: string,
): NewProjectVersionRequestBodyType['jsonBindings'] => {
    const jsonBindings: NewProjectVersionRequestBodyType['jsonBindings'] =
        config.json_bindings?.map((binding) => {
            if ('value' in binding) {
                return {
                    name: binding.name,
                    value: binding.value,
                };
            } else {
                const file = path.resolve(folder, binding.file);

                if (!fs.existsSync(file)) {
                    throw new Error(
                        `File for json binding ${binding.name} does not exist`,
                    );
                }

                try {
                    const contents = fs.readFileSync(file, 'utf-8');

                    const parsed = JSON.parse(contents);

                    return {
                        name: binding.name,
                        value: parsed,
                    };
                } catch (e) {
                    throw new Error(
                        `File for json binding ${binding.name} does not exist or is not valid JSON`,
                    );
                }
            }
        }) ?? [];

    return jsonBindings;
};

const resolveDataBindings = (
    config: z.infer<typeof baseConfigSchema>,
    folder: string,
): NewProjectVersionRequestBodyType['dataBindings'] => {
    const dataBindings: NewProjectVersionRequestBodyType['dataBindings'] =
        config.data_bindings?.map((binding) => {
            if ('base64' in binding) {
                return {
                    name: binding.name,
                    base64: binding.base64,
                };
            } else {
                const file = path.resolve(folder, binding.file);

                if (!fs.existsSync(file)) {
                    throw new Error(
                        `File for data binding ${binding.name} does not exist`,
                    );
                }

                try {
                    const contents = fs.readFileSync(file, 'base64');

                    return {
                        name: binding.name,
                        base64: contents,
                    };
                } catch (e) {
                    throw new Error(
                        `File for data binding ${binding.name} does not exist or is not valid JSON`,
                    );
                }
            }
        }) ?? [];

    return dataBindings;
};

const recursiveRead = (
    folder: string,
    opts?: {
        removeFromPath?: string;
    },
): {
    path: string;
    base64: string;
}[] => {
    const files = fs.readdirSync(folder);
    const result: { path: string; base64: string }[] = [];

    for (const file of files) {
        const fullPath = path.resolve(folder, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            result.push(...recursiveRead(fullPath, opts));
        } else {
            const contents = fs.readFileSync(fullPath, 'base64');

            let pathToUse = fullPath;

            if (opts?.removeFromPath) {
                pathToUse = pathToUse.replace(opts.removeFromPath, '');
            }

            result.push({
                path: pathToUse,
                base64: contents,
            });
        }
    }

    return result;
};

const resolveSites = (
    config: z.infer<typeof baseConfigSchema>,
    folder: string,
): NewProjectVersionRequestBodyType['sites'] => {
    const sites: NewProjectVersionRequestBodyType['sites'] =
        config.sites?.map(
            (
                site,
            ): NonNullable<
                NewProjectVersionRequestBodyType['sites']
            >[number] => {
                const siteFolder = path.resolve(folder, site.folder);

                const files = recursiveRead(siteFolder, {
                    removeFromPath: siteFolder,
                });

                return {
                    name: site.name,
                    files,
                };
            },
        ) ?? [];

    return sites;
};

export const configToVersionPush = async (
    input: z.infer<typeof baseConfigSchema>,
): Promise<NewProjectVersionRequestBodyType> => {
    const folder = path.resolve(process.cwd(), input.folder);
    const entrypoint = path.resolve(folder, input.entrypoint);

    const entrypointExists = fs.existsSync(entrypoint);
    const entrypointWithinFolder = entrypoint.startsWith(folder);

    if (!entrypointExists || !entrypointWithinFolder) {
        throw new Error(
            'Entrypoint does not exist or is not within the folder',
        );
    }

    // const entrypointFile = fs.readFileSync(entrypoint, 'base64');

    const yukakofolder = path.resolve(folder, './.yukako_cli');
    await fs.ensureDir(yukakofolder);

    const yukakobuild = path.resolve(yukakofolder, './build.js');

    // console.log('yukakobuild', yukakobuild);

    try {
        await esbuild.build({
            entryPoints: [entrypoint],
            bundle: true,
            format: 'esm',
            outfile: yukakobuild,
        });
    } catch (err) {
        let message = 'Error building entrypoint';

        if (err instanceof Error) {
            message = err.message;
        }

        console.error('Error building entrypoint', message);
        throw new Error(message);
    }

    const builtEntrypoint = fs.readFileSync(yukakobuild, 'base64');

    const result: NewProjectVersionRequestBodyType = {
        blobs: [
            {
                type: 'esmodule',
                data: builtEntrypoint,
                filename: input.entrypoint,
            },
        ],
        routes: input.routes.map((route) => ({
            host: route.host,
            basePaths: route.paths,
        })),
        kvBindings: input.kv_bindings?.map((binding) => ({
            name: binding.name,
            kvDatabaseId: binding.kv_database_id,
        })),
        textBindings: resolveTextBindings(input, folder),
        jsonBindings: resolveJsonBindings(input, folder),
        dataBindings: resolveDataBindings(input, folder),
        sites: resolveSites(input, folder),
    };

    return result;
};

// export const readProjectFile = (): Project => {
//     const project = findAndParseFile();
//
//     const parseResult = configFileSchema.safeParse(project);
//
//     if (!parseResult.success) {
//         throw parseResult.error;
//     }
//
//     const routes: ProjectRoute[] = parseResult.data.routes ?? [];
//
//     const deployments: ProjectDeployment[] = parseResult.data.deployments ?? [];
//
//     const text_bindings: ProjectTextBinding[] =
//         parseResult.data.text_bindings ?? [];
//     const json_bindings: ProjectJsonBinding[] =
//         parseResult.data.json_bindings ?? [];
//     const data_bindings: ProjectDataBinding[] =
//         parseResult.data.data_bindings ?? [];
//
//     return {
//         folder: process.cwd(),
//         entrypoint: parseResult.data.entrypoint,
//
//         routes,
//
//         deployments,
//
//         text_bindings,
//         json_bindings,
//         data_bindings,
//     };
// };
