import path from 'path';
import * as fs from 'fs-extra';
import { parse as yamlParse } from 'yaml';
import { parse as tomlParse } from 'toml';

export const findAndParseFile = (): unknown => {
    const dir = process.cwd();

    const jsonProjectFile = path.join(dir, 'yukako.json');
    const yamlProjectFile = path.join(dir, 'yukako.yaml');
    const ymlProjectFile = path.join(dir, 'yukako.yml');
    const tomlProjectFile = path.join(dir, 'yukako.toml');

    try {
        if (fs.existsSync(jsonProjectFile)) {
            return fs.readJSONSync(jsonProjectFile);
        }

        if (fs.existsSync(yamlProjectFile)) {
            const fileContents = fs.readFileSync(yamlProjectFile, 'utf8');
            return yamlParse(fileContents);
        }

        if (fs.existsSync(ymlProjectFile)) {
            const fileContents = fs.readFileSync(ymlProjectFile, 'utf8');
            return yamlParse(fileContents);
        }

        if (fs.existsSync(tomlProjectFile)) {
            const fileContents = fs.readFileSync(tomlProjectFile, 'utf8');
            return tomlParse(fileContents);
        }

        throw new Error('Project file does not exist or could not be parsed.');
    } catch (err) {
        throw new Error('Project file does not exist or could not be parsed.');
    }
};
