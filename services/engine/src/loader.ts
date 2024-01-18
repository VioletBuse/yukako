import { getDatabase } from '@yukako/state';
import { asc, desc } from 'drizzle-orm';
import {
    projectVersionBlobs,
    projectVersions,
} from '@yukako/state/src/db/schema';
import * as util from 'util';
import { test } from '@yukako/extensions';
import { createHash } from 'crypto';
import { BaseBindingData } from './configurator';

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
                    const base64 = binding.base64;
                    const buffer = Buffer.from(base64, 'base64');
                    const dataview = new DataView(
                        buffer.buffer,
                        buffer.byteOffset,
                        buffer.byteLength,
                    );

                    return {
                        type: 'data',
                        name: binding.name,
                        value: dataview,
                    };
                },
            );

            return {
                name: project.name,
                modules: project.projectVersions[0].projectVersionBlobs.map(
                    (blob) => {
                        const base64 = blob.blob.data;
                        const buffer = Buffer.from(base64, 'base64');
                        const dataview = new DataView(
                            buffer.buffer,
                            buffer.byteOffset,
                            buffer.byteLength,
                        );

                        const sha256 = createHash('sha256')
                            .update(base64)
                            .digest('hex');

                        return {
                            importName: blob.blob.filename,
                            fileName: sha256,
                            fileContent: dataview,
                            type: blob.blob.type,
                        };
                    },
                ),
                bindings: [...textBindings, ...jsonBindings, ...dataBindings],
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
