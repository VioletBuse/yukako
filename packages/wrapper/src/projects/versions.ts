import {
    NewProjectVersionRequestBodyType,
    ProjectVersionsDataResponseBodySchema,
    ProjectVersionsDataResponseBodyType,
} from '@yukako/types';
import { handleResponse } from '../util/responseHandler';
import { z } from 'zod';
import { Options } from '../index';

export const VersionsWrapper = (
    server: string,
    sessionId: string,
    options?: Options,
) => ({
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

            return handleResponse(
                ProjectVersionsDataResponseBodySchema,
                resp,
                options,
            );
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
    list: async (
        projectId: string,
        opts?: {
            limit?: number;
            page?: number;
        },
    ): Promise<
        [ProjectVersionsDataResponseBodyType[], null] | [null, string]
    > => {
        const limit = opts?.limit || 10;
        const page = opts?.page || 0;

        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        params.append('page', page.toString());

        try {
            const resp = await fetch(
                `${server}/api/projects/${projectId}/versions?${params.toString()}`,
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
                options,
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

            return handleResponse(
                ProjectVersionsDataResponseBodySchema,
                resp,
                options,
            );
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

            return handleResponse(
                ProjectVersionsDataResponseBodySchema,
                resp,
                options,
            );
        } catch (error) {
            return [null, 'An unknown error occurred.'];
        }
    },
});
