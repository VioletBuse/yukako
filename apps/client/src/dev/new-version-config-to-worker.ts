import { NewProjectVersionRequestBodyType } from '@yukako/types';
import { AddWorkerData } from '@yukako/engineer';
import { base64Hash, base64ToDataView } from '@yukako/base64ops';
import { BaseBindingData } from '@yukako/engineer/src/configurator';
import { generateKvBinding } from '@yukako/engineer/src/util/bindings/kv';
import { generateSiteBinding } from '@yukako/engineer/src/util/bindings/site';

export const configToWorkers = (
    val: NewProjectVersionRequestBodyType,
): AddWorkerData => {
    const textBindings =
        val.textBindings?.map(
            (binding): BaseBindingData => ({
                name: binding.name,
                type: 'text',
                value: binding.value,
            }),
        ) || [];

    const jsonBindings =
        val.jsonBindings?.map(
            (binding): BaseBindingData => ({
                name: binding.name,
                type: 'json',
                value: binding.value,
            }),
        ) || [];

    const dataBindings =
        val.dataBindings?.map(
            (binding): BaseBindingData => ({
                name: binding.name,
                type: 'data',
                value: base64ToDataView(binding.base64),
            }),
        ) || [];

    const kvBindings =
        val.kvBindings?.map((binding) =>
            generateKvBinding(binding.name, binding.kvDatabaseId),
        ) || [];

    const siteBindings =
        val.sites?.map((site) => generateSiteBinding(site.name, site.files)) ||
        [];

    return {
        name: 'dev-worker',
        modules: val.blobs.map((blob): AddWorkerData['modules'][number] => ({
            importName: blob.filename,
            fileName: base64Hash(blob.data),
            fileContent: base64ToDataView(blob.data),
            type: blob.type,
        })),
        bindings: [
            ...textBindings,
            ...jsonBindings,
            ...dataBindings,
            ...kvBindings,
            ...siteBindings,
        ],
        routing: val.routes.map((route): AddWorkerData['routing'][number] => ({
            host: '*',
            basePaths: route.basePaths,
        })),
    };
};
