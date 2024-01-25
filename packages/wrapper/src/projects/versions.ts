import {
    NewProjectVersionRequestBodyType,
    ProjectVersionsDataResponseBodySchema,
    ProjectVersionsDataResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler';
import { z } from 'zod';

export const VersionsWrapper = (server: string, sessionId: string) => ({
    new: async (
        projectId: string,
        data: NewProjectVersionRequestBodyType,
    ): Promise<
        [ProjectVersionsDataResponseBodyType, null] | [null, string]
    > => {
        try {
            const resp = await fetch(
                `${server}/api/projects/${projectId}/versions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': sessionId,
                    },
                    body: JSON.stringify(data),
                },
            );

            return handleResponse(ProjectVersionsDataResponseBodySchema, resp);
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
    list: async (
        projectId: string,
    ): Promise<
        [ProjectVersionsDataResponseBodyType[], null] | [null, string]
    > => {
        try {
            const resp = await fetch(
                `${server}/api/projects/${projectId}/versions`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': sessionId,
                    },
                },
            );

            return handleResponse(
                z.array(ProjectVersionsDataResponseBodySchema),
                resp,
            );
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
    findByVersion: async (
        projectId: string,
        version: number,
    ): Promise<
        [ProjectVersionsDataResponseBodyType, null] | [null, string]
    > => {
        try {
            const resp = await fetch(
                `${server}/api/projects/${projectId}/versions/find-by-version/${version}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': sessionId,
                    },
                },
            );

            return handleResponse(ProjectVersionsDataResponseBodySchema, resp);
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
    findById: async (
        projectId: string,
        versionId: string,
    ): Promise<
        [ProjectVersionsDataResponseBodyType, null] | [null, string]
    > => {
        try {
            const resp = await fetch(
                `${server}/api/projects/${projectId}/versions/${versionId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': sessionId,
                    },
                },
            );

            return handleResponse(ProjectVersionsDataResponseBodySchema, resp);
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
