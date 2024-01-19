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

    binary_bindings: z
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
});

type ProjectRoute = {
    host: string;
    paths: string[];
};

type ProjectDeployment = {
    server: string;
    name: string;
    id: string;
};

type ProjectTextBinding =
    | {
          name: string;
          value: string;
      }
    | {
          name: string;
          file: string;
      };

type ProjectJsonBinding =
    | {
          name: string;
          value: any;
      }
    | {
          name: string;
          file: string;
      };

type ProjectBinaryBinding =
    | {
          name: string;
          base64: string;
      }
    | {
          name: string;
          file: string;
      };

type Project = {
    folder: string;
    entrypoint: string;

    routes: ProjectRoute[];

    deployments: ProjectDeployment[];

    text_bindings: ProjectTextBinding[];
    json_bindings: ProjectJsonBinding[];
    binary_bindings: ProjectBinaryBinding[];
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

    const routes: ProjectRoute[] = parseResult.data.routes ?? [];

    const deployments: ProjectDeployment[] = parseResult.data.deployments ?? [];

    const text_bindings: ProjectTextBinding[] =
        parseResult.data.text_bindings ?? [];
    const json_bindings: ProjectJsonBinding[] =
        parseResult.data.json_bindings ?? [];
    const binary_bindings: ProjectBinaryBinding[] =
        parseResult.data.binary_bindings ?? [];

    return {
        folder: dir,
        entrypoint: parseResult.data.entrypoint,

        routes,

        deployments,
    };
};
