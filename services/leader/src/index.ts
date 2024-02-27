import { NodeRegistrationManager } from './registration';

export const LeaderService = {
    start: (id: string) => {
        console.log('Starting leader service...');
        NodeRegistrationManager.start();
    },
    stop: () => {
        console.log('Stopping leader service...');
        NodeRegistrationManager.stop();
    },
};
