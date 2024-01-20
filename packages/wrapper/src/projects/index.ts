import { VersionsWrapper } from './versions';

export const ProjectsWrapper = (server: string, sessionId: string) => ({
    versions: VersionsWrapper(server, sessionId),
});
