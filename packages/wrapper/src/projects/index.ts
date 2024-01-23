import { VersionsWrapper } from './versions';
import {
    ProjectsNewProjectResponseBodySchema,
    ProjectsNewProjectResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler';

export const ProjectsWrapper = (server: string, sessionId: string) => ({
    versions: VersionsWrapper(server, sessionId),
    create: async (
        name: string,
    ): Promise<[ProjectsNewProjectResponseBodyType, null] | [null, string]> => {
        try {
            const resp = await fetch(`${server}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
                body: JSON.stringify({ name }),
            });

            return handleResponse(ProjectsNewProjectResponseBodySchema, resp);
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
