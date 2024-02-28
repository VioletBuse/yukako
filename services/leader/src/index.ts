import { NodeRegistrationManager } from './registration';
import { SidecarProjectsManager } from './projects';

export const LeaderService = {
    start: async (id: string) => {
        console.log('Starting leader service...');
        NodeRegistrationManager.start();
        await SidecarProjectsManager.start();
    },
    stop: async () => {
        console.log('Stopping leader service...');
        NodeRegistrationManager.stop();
        await SidecarProjectsManager.stop();
    },
};
