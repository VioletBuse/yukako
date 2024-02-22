import { z } from 'zod';
import { baseConfigSchema } from '../schemas';
import { NewProjectVersionRequestBodyType } from '@yukako/types';
import path from 'path';
import * as fs from 'fs-extra';

export const resolveDataBindings = (
    config: z.infer<typeof baseConfigSchema>,
    folder: string,
): NewProjectVersionRequestBodyType['dataBindings'] => {
    const dataBindings: NewProjectVersionRequestBodyType['dataBindings'] =
        config.data_bindings?.map((binding) => {
            if ('base64' in binding) {
                return {
                    name: binding.name,
                    base64: binding.base64,
                };
            } else {
                const file = path.resolve(folder, binding.file);

                if (!fs.existsSync(file)) {
                    throw new Error(
                        `File for data binding ${binding.name} does not exist`,
                    );
                }

                try {
                    const contents = fs.readFileSync(file, 'base64');

                    return {
                        name: binding.name,
                        base64: contents,
                    };
                } catch (e) {
                    throw new Error(
                        `File for data binding ${binding.name} does not exist or is not valid JSON`,
                    );
                }
            }
        }) ?? [];

    return dataBindings;
};
