import * as fs from 'fs-extra';
import * as path from 'path';
import { z } from 'zod';

const configFileSchema = z.object({
    folder: z.string(),
    entrypoint: z.string(),

    routes: z.array(
        z.object({
            host: z.string(),
            paths: z.array(z.string()),
        }),
    ),

    deployments: z.array(
        z.object({
            server: z.string(),
            name: z.string(),
            id: z.string(),
        }),
    ),
});

type Project = {
    folder: string;
    entrypoint: string;

    routes: {
        host: string;
        paths: string[];
    }[];

    deployments: {
        server: string;
        name: string;
        id: string;
    }[];
};

export const readProjectFile = (): Project => {
    const dir = process.cwd();
    const projectFile = path.join(dir, 'yukako.json');

    if (!fs.existsSync(projectFile)) {
        throw new Error('Project file does not exist');
    }

    const project = fs.readJSONSync(projectFile);

    const parseResult = configFileSchema.safeParse(project);

    if (!parseResult.success) {
        throw parseResult.error;
    }

    return parseResult.data;
};
