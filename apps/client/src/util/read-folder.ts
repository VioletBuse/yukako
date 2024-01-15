import path from 'path';
import * as fs from 'fs-extra';

type FileType = 'esmodule' | 'text' | 'wasm' | 'data' | 'json';

type File = {
    name: string;
    path: string;
    base64: string;
    type: FileType;
};

type FileTypeException = {
    path: string;
    type: FileType;
};

export const recursivelyReadFolder = (
    folder: string,
    exceptions?: FileTypeException[],
): File[] => {
    const files: File[] = [];

    const _recursivelyReadFolder = (folder: string) => {
        const dir = fs.readdirSync(folder);

        for (const file of dir) {
            const filePath = path.join(folder, file);

            if (fs.statSync(filePath).isDirectory()) {
                _recursivelyReadFolder(filePath);
            } else {
                const base64 = fs.readFileSync(filePath).toString('base64');

                let type: FileType;

                const currentException = exceptions?.find(
                    (except) => except.path === filePath,
                );

                if (currentException) {
                    type = currentException.type;
                } else if (
                    filePath.endsWith('js') ||
                    filePath.endsWith('jsx') ||
                    filePath.endsWith('mjs')
                ) {
                    type = 'esmodule';
                } else if (filePath.endsWith('json')) {
                    type = 'json';
                } else if (filePath.endsWith('txt')) {
                    type = 'text';
                } else if (
                    filePath.endsWith('wasm') ||
                    filePath.endsWith('wat')
                ) {
                    type = 'wasm';
                } else {
                    type = 'data';
                }

                files.push({
                    name: file,
                    path: filePath,
                    base64,
                    type,
                });
            }
        }
    };

    _recursivelyReadFolder(folder);

    return files;
};
