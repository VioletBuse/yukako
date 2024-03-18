import * as fs from 'fs-extra';
import * as path from 'path';
import * as esbuild from 'esbuild';
import chokidar, { FSWatcher } from 'chokidar';
import { z } from 'zod';
import { NewProjectVersionRequestBodyType } from '@yukako/types/src/admin-api/projects/versions.ts';
import { baseConfigSchema } from './schemas';
import { resolveTextBindings } from './resolvers/text-bindings';
import { resolveJsonBindings } from './resolvers/json-bindings';
import { resolveDataBindings } from './resolvers/data-bindings';
import { resolveSites } from './resolvers/sites';
import debounce from 'debounce';

const resolveResult = (
    input: z.infer<typeof baseConfigSchema>,
    folder: string,
) => {
    const yukakofolder = path.resolve(folder, './.yukako_cli');
    const yukakobuild = path.resolve(yukakofolder, './build.js');

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
        queueBindings: input.queue_bindings?.map((binding) => ({
            name: binding.name,
            queueId: binding.queue_id,
        })),
        textBindings: resolveTextBindings(input, folder),
        jsonBindings: resolveJsonBindings(input, folder),
        dataBindings: resolveDataBindings(input, folder),
        environmentBindings: input.environment_bindings?.map((binding) => ({
            name: binding.name,
            envVar: binding.env_var,
        })),
        sites: resolveSites(input, folder),
        cronJobs: input.cron_jobs,
    };

    return result;
};

export const configToVersionPush = async <
    watch extends boolean = false,
    result = watch extends false
        ? NewProjectVersionRequestBodyType
        : { stop: () => void; start: () => Promise<void> },
>(
    input: z.infer<typeof baseConfigSchema>,
    opts: {
        watch: watch;
        onChange: watch extends true
            ? (val: NewProjectVersionRequestBodyType) => void
            : undefined | null;
    },
): Promise<result> => {
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

    if (opts.watch === false) {
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

            console.error(message);
            throw new Error(message);
        }

        const builtEntrypoint = fs.readFileSync(yukakobuild, 'base64');

        const result = resolveResult(input, folder);

        return result as result;
    } else {
        try {
            let ctx: esbuild.BuildContext;
            let fsWatcher: FSWatcher;

            const stop = () => {
                if (ctx) {
                    ctx.dispose();
                }
                if (fsWatcher) {
                    fsWatcher.close();
                }
            };

            const start = async () => {
                ctx = await esbuild.context({
                    entryPoints: [entrypoint],
                    bundle: true,
                    format: 'esm',
                    outfile: yukakobuild,
                });

                const watch = ctx.watch();

                fsWatcher = chokidar.watch(folder, {
                    persistent: true,
                });

                fsWatcher.on(
                    'all',
                    debounce(
                        () => {
                            opts.onChange?.(resolveResult(input, folder));
                        },
                        1000,
                        { immediate: true },
                    ),
                );

                await watch;
            };

            return {
                stop,
                start,
            } as result;
        } catch (err) {
            let message = 'Error building entrypoint';

            if (err instanceof Error) {
                message = err.message;
            }

            console.error(message);
            throw new Error(message);
        }
    }
};
