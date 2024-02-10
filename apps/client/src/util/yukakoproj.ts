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

            routes: z
                .array(
                    z.object({
                        host: z.string(),
                        paths: z.array(z.string()),
                    }),
                )
                .optional(),
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
});

export type ProjectRoute = {
    host: string;
    paths: string[];
};

export type ProjectDeployment = {
    server: string;
    name: string;
    id: string;

    routes?: ProjectRoute[];
};

export type ProjectTextBinding =
    | {
          name: string;
          value: string;
      }
    | {
          name: string;
          file: string;
      };

export type ProjectJsonBinding =
    | {
          name: string;
          value: any;
      }
    | {
          name: string;
          file: string;
      };

export type ProjectDataBinding =
    | {
          name: string;
          base64: string;
      }
    | {
          name: string;
          file: string;
      };

export type Project = {
    folder: string;
    entrypoint: string;

    routes: ProjectRoute[];

    deployments: ProjectDeployment[];

    text_bindings: ProjectTextBinding[];
    json_bindings: ProjectJsonBinding[];
    data_bindings: ProjectDataBinding[];
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
    const data_bindings: ProjectDataBinding[] =
        parseResult.data.data_bindings ?? [];

    return {
        folder: dir,
        entrypoint: parseResult.data.entrypoint,

        routes,

        deployments,

        text_bindings,
        json_bindings,
        data_bindings,
    };
};
