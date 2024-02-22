import { z } from 'zod';
import { baseConfigSchema } from '../schemas';
import { NewProjectVersionRequestBodyType } from '@yukako/types';
import path from 'path';
import * as fs from 'fs-extra';

export const resolveTextBindings = (
    config: z.infer<typeof baseConfigSchema>,
    folder: string,
): NewProjectVersionRequestBodyType['textBindings'] => {
    const textBindings: NewProjectVersionRequestBodyType['textBindings'] =
        config.text_bindings?.map((binding) => {
            if ('value' in binding) {
                return {
                    name: binding.name,
                    value: binding.value,
                };
            } else {
                const file = path.resolve(folder, binding.file);

                if (!fs.existsSync(file)) {
                    throw new Error(
                        `File for text binding ${binding.name} does not exist`,
                    );
                }
                try {
                    const contents = fs.readFileSync(file, 'utf-8');

                    return {
                        name: binding.name,
                        value: contents,
                    };
                } catch (e) {
                    throw new Error(
                        `File for text binding ${binding.name} does not exist`,
                    );
                }
            }
        }) ?? [];

    return textBindings;
};
