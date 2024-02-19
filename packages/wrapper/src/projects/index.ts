import { ProjectSpecificVersionsWrapper } from './versions';
import {
    ProjectsNewProjectResponseBodySchema,
    ProjectsNewProjectResponseBodyType,
    ProjectsProjectDataResponseBodySchema,
    ProjectsProjectDataResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler.js';
import { z } from 'zod';
import { Options } from '../index.js';

export const ProjectsWrapper = (
    server: string,
    sessionId: string,
    opts?: Options,
) => ({
    versions: ProjectSpecificVersionsWrapper(server, sessionId, opts),
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

            return handleResponse(
                ProjectsNewProjectResponseBodySchema,
                resp,
                opts,
            );
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
                opts,
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

            return handleResponse(
                ProjectsProjectDataResponseBodySchema,
                resp,
                opts,
            );
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

            return handleResponse(
                ProjectsProjectDataResponseBodySchema,
                resp,
                opts,
            );
        } catch (e) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
