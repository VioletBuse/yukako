import { BaseBindingData } from '../../configurator';

export const generateKvBinding = (
    name: string,
    dbId: string,
): BaseBindingData => ({
    name: name,
    type: 'wrapped',
    module: 'kv-extension',
    innerBindings: [
        {
            type: 'text',
            name: 'KV_DB_ID',
            value: dbId,
        },
        {
            type: 'service',
            name: '__admin',
            service: 'admin-service',
        },
    ],
});
