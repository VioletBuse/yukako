import { PassthroughWrapper } from '@yukako/wrapper';
import { ProjectsProjectDataResponseBodySchema } from '@yukako/types';
import { useValidatedSWR } from '@/lib/hooks/validated-swr';

export const useGetProjectById = (id: string) => {
    return useValidatedSWR(
        `/api/projects/${id}`,
        (server, token) => PassthroughWrapper(server, token).projects.getById,
        ProjectsProjectDataResponseBodySchema,
        [id],
    );
};
