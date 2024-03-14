import { readConfig } from './main-config.js';
import ora, { Ora } from 'ora';
import { input, select } from '@inquirer/prompts';
import { z } from 'zod';
import { Wrapper } from '@yukako/wrapper';

export const validateServerString = (val: string) => {
    try {
        z.string().url().parse(val);

        const url = new URL(val);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return 'Url scheme must be http or https';
        }

        if (url.pathname !== '/') {
            return 'Url path must be /';
        }

        return true;
    } catch (e) {
        return 'Please enter a valid URL';
    }
};

export const selectServer = async (opts: {
    canSelectWithoutLoggedIn: boolean;
    spinner?: Ora;
    serverOption?: unknown;
    optionsObject?: unknown;
}): Promise<string | null> => {
    const spinner = opts?.spinner ?? ora();

    const config = readConfig();
    const servers = config.servers;

    let serverOption: string | null;

    if (typeof opts?.serverOption === 'string') {
        const valid = validateServerString(opts.serverOption);
        if (valid === true) {
            serverOption = opts.serverOption;
        } else {
            spinner.fail(valid);
            return null;
        }
    } else if (
        typeof opts?.optionsObject === 'object' &&
        opts?.optionsObject !== null &&
        'server' in opts?.optionsObject &&
        typeof opts?.optionsObject.server === 'string'
    ) {
        const valid = validateServerString(opts.optionsObject.server);
        if (valid === true) {
            serverOption = opts.optionsObject.server;
        } else {
            spinner.fail(valid);
            return null;
        }
    } else {
        serverOption = null;
    }

    if (serverOption !== null) {
        if (servers[serverOption] === undefined) {
            spinner.fail('Server not found in config.');
            return null;
        }

        const serverObject = servers[serverOption];

        if (!serverObject.auth.sessionId) {
            spinner.fail(`Not logged in to server ${serverOption}.`);
            return null;
        }

        const sessionId = serverObject.auth.sessionId;

        try {
            spinner.start('Connecting to server...');
            const client = Wrapper(serverOption, sessionId);
            const [me, error] = await client.auth.me();
            spinner.stop();

            if (error) {
                spinner.fail(error);
                return null;
            } else if (me === null) {
                spinner.fail('Failed to connect to server.');
                return null;
            } else {
                return serverOption;
            }
        } catch (err) {
            spinner.fail('Failed to connect to server.');
            return null;
        }
    }

    const choices = Object.keys(servers).map((server) => ({
        name: server,
        value: server,
    }));

    if (choices.length === 0 && !opts?.canSelectWithoutLoggedIn) {
        spinner.fail('No servers found.');
        return null;
    }

    if (opts?.canSelectWithoutLoggedIn) {
        choices.push({
            name: 'Custom',
            value: 'custom',
        });
    }

    const serverChoice = await select({
        message: 'Select a yukako admin server',
        choices,
    });

    if (serverChoice !== 'custom') {
        try {
            const serverObject = servers[serverChoice];

            const sessionId = serverObject?.auth?.sessionId;

            if (opts.canSelectWithoutLoggedIn) {
                return serverChoice;
            }

            if (!sessionId) {
                if (!opts?.canSelectWithoutLoggedIn) {
                    spinner.fail(`Not logged in to server ${serverChoice}.`);
                    return null;
                } else {
                    return serverChoice;
                }
            }

            spinner.start('Connecting to server...');
            const client = Wrapper(serverChoice, sessionId);
            const [me, error] = await client.auth.me();
            spinner.stop();

            if (error) {
                spinner.fail(error);
                return null;
            } else if (me === null) {
                spinner.fail(
                    'Failed to connect to server. You may need to log in.',
                );
                return null;
            } else {
                return serverChoice;
            }
        } catch (err) {
            spinner.fail(
                'Failed to connect to server. You may need to log in.',
            );
            return null;
        }
    }

    const customServerChoice = await input({
        message: 'Enter a yukako admin server URL',
        validate: validateServerString,
    });

    const valid = validateServerString(customServerChoice);

    if (!valid) {
        spinner.fail('Please enter a valid URL.');
        return null;
    }

    if (opts?.canSelectWithoutLoggedIn) {
        return customServerChoice;
    }

    if (servers[customServerChoice] === undefined) {
        spinner.fail('Server not found in config.');
        return null;
    }

    const serverObject = servers[customServerChoice];

    if (!serverObject.auth.sessionId) {
        spinner.fail(`Not logged in to server ${customServerChoice}.`);
        return null;
    }

    const sessionId = serverObject.auth.sessionId;

    try {
        spinner.start('Connecting to server...');
        const client = Wrapper(customServerChoice, sessionId);
        const [me, error] = await client.auth.me();
        spinner.stop();

        if (error) {
            spinner.fail(error);
            return null;
        } else if (me === null) {
            spinner.fail('Failed to connect to server.');
            return null;
        } else {
            return customServerChoice;
        }
    } catch (err) {
        spinner.fail('Failed to connect to server.');
        return null;
    }
};
