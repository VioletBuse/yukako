import { VersionsWrapper } from './versions';
import {
    ProjectsNewProjectResponseBodySchema,
    ProjectsNewProjectResponseBodyType,
    ProjectsProjectDataResponseBodySchema,
    ProjectsProjectDataResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler';
import { z } from 'zod';

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
    list: async (): Promise<
        [ProjectsProjectDataResponseBodyType[], null] | [null, string]
    > => {
        try {
            const resp = await fetch(`${server}/api/projects`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
            });

            return handleResponse(
                z.array(ProjectsProjectDataResponseBodySchema),
                resp,
            );
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
    getById: async (
        id: string,
    ): Promise<
        [ProjectsProjectDataResponseBodyType, null] | [null, string]
    > => {
        try {
            const resp = await fetch(`${server}/api/projects/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': sessionId,
                },
            });

            return handleResponse(ProjectsProjectDataResponseBodySchema, resp);
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
    getByName: async (
        name: string,
    ): Promise<
        [ProjectsProjectDataResponseBodyType, null] | [null, string]
    > => {
        try {
            const resp = await fetch(
                `${server}/api/projects/find-by-name/${name}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': sessionId,
                    },
                },
            );

            return handleResponse(ProjectsProjectDataResponseBodySchema, resp);
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
