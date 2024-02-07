import { useValidatedSWR } from '@/lib/hooks/validated-swr';
import { PassthroughWrapper } from '@yukako/wrapper';
import { z } from 'zod';
import { ProjectsProjectDataResponseBodySchema } from '@yukako/types';

export const useListProjects = () => {
    return useValidatedSWR(
        '/api/projects',
        (server, token) => PassthroughWrapper(server, token).projects.list,
        z.array(ProjectsProjectDataResponseBodySchema),
        [],
    );
};
