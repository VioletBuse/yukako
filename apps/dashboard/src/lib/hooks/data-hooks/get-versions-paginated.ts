import { useValidatedSWR } from '@/lib/hooks/validated-swr';
import { PassthroughWrapper } from '@yukako/wrapper';
import {
    ProjectsProjectDataResponseBodySchema,
    ProjectVersionsDataResponseBodySchema,
} from '@yukako/types';
import { z } from 'zod';

export const useGetVersionsForProject = (data: {
    projectId: string;
    limit: number;
    page: number;
}) => {
    return useValidatedSWR(
        `/api/projects/${data.projectId}/versions?limit=${data.limit}&page=${data.page}`,
        (server, token) =>
            PassthroughWrapper(server, token).projects.versions.list,
        z.array(ProjectVersionsDataResponseBodySchema),
        [
            data.projectId,
            {
                limit: data.limit,
                page: data.page - 1,
            },
        ],
    );
};
