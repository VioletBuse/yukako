import { findFile } from './parse-file';
import chokidar from 'chokidar';
import debounce from 'debounce';

export const watchConfig = (callback: () => void) => {
    const file = findFile();

    const watcher = chokidar.watch(file);

    watcher.on('all', debounce(callback, 1000, { immediate: true }));

    return {
        stop: () => {
            watcher.close();
        },
    };
};
