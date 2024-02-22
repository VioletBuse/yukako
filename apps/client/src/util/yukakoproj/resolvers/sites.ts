import * as fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';
import { baseConfigSchema } from '../schemas';
import { NewProjectVersionRequestBodyType } from '@yukako/types';

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

export const resolveSites = (
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
