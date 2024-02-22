import { findAndParseFile } from './parse-file';
import {
    baseConfigSchema,
    configFileSchema,
    deploymentFileSchema,
} from './schemas';
import { z } from 'zod';

export const getDeployments = () => {
    const project = findAndParseFile();

    const parseResult = deploymentFileSchema.safeParse(project);

    if (!parseResult.success) {
        throw parseResult.error;
    }

    return parseResult.data.deployments;
};

export const getConfig = (
    deploymentid?: string,
): z.infer<typeof baseConfigSchema> => {
    const project = findAndParseFile();

    const parseResult = configFileSchema.safeParse(project);

    if (!parseResult.success) {
        throw parseResult.error;
    }

    if (!deploymentid) {
        return parseResult.data;
    }

    const { deployments, ...config } = parseResult.data;

    const deployment = deployments.find((d: any) => d.id === deploymentid);

    if (!deployment) {
        throw new Error('Deployment not found');
    }

    const { server, name, id, ...rest } = deployment;

    return { ...config, ...rest };
};
