import { aquireLock, checkLock, releaseLock } from './leader';

export const LeaderService = {
    start: (id: string) => {
        checkLock('test-id');
        console.log('Starting leader service...');
    },
    stop: () => {
        console.log('Stopping leader service...');
    },
};
