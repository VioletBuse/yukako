import { BaseBindingData } from '../../configurator';
import { base64Hash, base64ToDataView } from '@yukako/base64ops';

export const generateSiteBinding = (
    name: string,
    files: { path: string; base64: string }[],
): BaseBindingData => ({
    name: name,
    type: 'wrapped',
    module: 'sites-extension',
    innerBindings: [
        ...files.map(
            (file): BaseBindingData => ({
                type: 'data',
                name: file.path,
                value: base64ToDataView(file.base64),
                customDataFileName: base64Hash(file.base64),
            }),
        ),
    ],
});
