import { getDatabase } from '@yukako/state';
import { asc, desc } from 'drizzle-orm';
import * as util from 'util';
import { test } from '@yukako/extensions';
import { createHash } from 'crypto';
import { BaseBindingData } from './configurator';
import { base64ToDataView, base64Hash } from '@yukako/base64ops';
import { ExternalServer } from './config';
import {
    projectVersionBlobs,
    projectVersions,
} from '@yukako/state/src/db/schema';

export const loadProjects = async () => {
    const db = getDatabase();

    const projects = await db.query.projects.findMany({
        with: {
            projectVersions: {
                orderBy: desc(projectVersions.version),
                limit: 1,
                with: {
                    routes: true,
                    projectVersionBlobs: {
                        orderBy: asc(projectVersionBlobs.order),
                        with: {
                            blob: true,
                        },
                    },
                    textBindings: true,
                    jsonBindings: true,
                    dataBindings: true,
                    kvDatabases: true,
                    sites: {
                        with: {
                            files: true,
                        },
                    },
                },
            },
        },
    });

    const workers = projects
        .filter(
            (project) =>
                project.projectVersions.length > 0 &&
                project.projectVersions[0].projectVersionBlobs.length > 0,
        )
        .map((project) => {
            const textBindings = project.projectVersions[0].textBindings.map(
                (binding): BaseBindingData => {
                    return {
                        type: 'text',
                        name: binding.name,
                        value: binding.value,
                    };
                },
            );

            const jsonBindings = project.projectVersions[0].jsonBindings.map(
                (binding): BaseBindingData => {
                    return {
                        type: 'json',
                        name: binding.name,
                        value: binding.value,
                    };
                },
            );

            const dataBindings = project.projectVersions[0].dataBindings.map(
                (binding): BaseBindingData => {
                    return {
                        type: 'data',
                        name: binding.name,
                        value: base64ToDataView(binding.base64),
                    };
                },
            );

            // const kvBindings: BaseBindingData[] = [
            //     {
            //         name: 'KV_BINDING',
            //         type: 'wrapped',
            //         module: 'kv-extension',
            //         innerBindings: [
            //             {
            //                 type: 'text',
            //                 name: 'KV_DB_ID',
            //                 value: 'BASE_KV_DB_ID',
            //             },
            //             {
            //                 type: 'service',
            //                 name: '__admin',
            //                 service: 'admin-service',
            //             },
            //         ],
            //     },
            // ];

            const kvBindings: BaseBindingData[] =
                project.projectVersions[0].kvDatabases.map((binding) => ({
                    name: binding.name,
                    type: 'wrapped',
                    module: 'kv-extension',
                    innerBindings: [
                        {
                            type: 'text',
                            name: 'KV_DB_ID',
                            value: binding.kvDatabaseId,
                        },
                        {
                            type: 'service',
                            name: '__admin',
                            service: 'admin-service',
                        },
                    ],
                }));

            const sitesBindings: BaseBindingData[] =
                project.projectVersions[0].sites.map((site) => {
                    return {
                        name: site.name,
                        type: 'wrapped',
                        module: 'sites-extension',
                        innerBindings: [
                            ...site.files.map(
                                (file): BaseBindingData => ({
                                    type: 'data',
                                    name: file.path,
                                    value: base64ToDataView(file.base64),
                                    customDataFileName: base64Hash(file.base64),
                                }),
                            ),
                        ],
                    };
                });

            const bindings = [
                ...textBindings,
                ...jsonBindings,
                ...dataBindings,
                ...kvBindings,
                ...sitesBindings,
            ];

            // console.log('Reloading project with bindings:');
            // console.log(
            //     util.inspect(bindings, false, null, true /* enable colors */),
            // );

            return {
                name: project.name,
                modules: project.projectVersions[0].projectVersionBlobs.map(
                    (blob) => {
                        const base64 = blob.blob.data;
                        const dataview = base64ToDataView(base64);

                        const sha256 = base64Hash(base64);

                        return {
                            importName: blob.blob.filename,
                            fileName: sha256,
                            fileContent: dataview,
                            type: blob.blob.type,
                        };
                    },
                ),
                bindings: bindings,
                routing: project.projectVersions[0].routes.map((route) => {
                    return {
                        host: route.host,
                        basePaths: route.basePaths,
                    };
                }),
            };
        });

    // console.log(util.inspect(workers, false, null, true /* enable colors */));

    return workers;
};
