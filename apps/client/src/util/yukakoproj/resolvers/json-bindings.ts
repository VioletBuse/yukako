import { z } from 'zod';
import { baseConfigSchema } from '../schemas';
import { NewProjectVersionRequestBodyType } from '@yukako/types';
import path from 'path';
import * as fs from 'fs-extra';

export const resolveJsonBindings = (
    config: z.infer<typeof baseConfigSchema>,
    folder: string,
): NewProjectVersionRequestBodyType['jsonBindings'] => {
    const jsonBindings: NewProjectVersionRequestBodyType['jsonBindings'] =
        config.json_bindings?.map((binding) => {
            if ('value' in binding) {
                return {
                    name: binding.name,
                    value: binding.value,
                };
            } else {
                const file = path.resolve(folder, binding.file);

                if (!fs.existsSync(file)) {
                    throw new Error(
                        `File for json binding ${binding.name} does not exist`,
                    );
                }

                try {
                    const contents = fs.readFileSync(file, 'utf-8');

                    const parsed = JSON.parse(contents);

                    return {
                        name: binding.name,
                        value: parsed,
                    };
                } catch (e) {
                    throw new Error(
                        `File for json binding ${binding.name} does not exist or is not valid JSON`,
                    );
                }
            }
        }) ?? [];

    return jsonBindings;
};
