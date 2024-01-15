import * as path from 'path';
import { z } from 'zod';
import * as fs from 'fs-extra';

const home = require('os').homedir();
const configFilePath = path.join(home, '.yukactlrc');

const schema = z.object({
    servers: z.record(
        z.string().url(),
        z.object({
            auth: z.object({
                sessionId: z.string().nullish(),
            }),
        }),
    ),
});

type UnderlyingConfig = z.infer<typeof schema>;

const defaultConfig: UnderlyingConfig = {
    servers: {},
};

type Config = {
    servers: Record<
        string,
        {
            auth: {
                sessionId?: string | null;
            };
        }
    >;
};

export const readConfig = (): Config => {
    try {
        const _config = fs.readJSONSync(configFilePath);
        return schema.parse(_config);
    } catch (e) {
        fs.writeJSONSync(configFilePath, defaultConfig);
        return defaultConfig;
    }
};

export const writeConfig = (config: Config) => {
    fs.writeJSONSync(configFilePath, config);
};

export const getSessionId = (server: string): string | null | undefined => {
    const config = readConfig();
    return config.servers[server]?.auth.sessionId;
};
