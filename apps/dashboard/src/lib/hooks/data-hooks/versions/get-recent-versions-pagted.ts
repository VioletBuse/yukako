import { useValidatedSWR } from '@/lib/hooks/validated-swr';
import { PassthroughWrapper } from '@yukako/wrapper';
import { z } from 'zod';
import { ProjectVersionsDataResponseBodySchema } from '@yukako/types';

export const useGetRecentVersions = (data: { limit: number; page: number }) => {
    return useValidatedSWR(
        `/api/versions?limit=${data.limit}&page=${data.page}`,
        (server, token) =>
            PassthroughWrapper(server, token).versions.listRecent,
        z.array(ProjectVersionsDataResponseBodySchema),
        [
            {
                limit: data.limit,
                page: data.page - 1,
            },
        ],
    );
};
