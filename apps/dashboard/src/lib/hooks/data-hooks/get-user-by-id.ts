import { useValidatedSWR } from '@/lib/hooks/validated-swr';
import { PassthroughWrapper } from '@yukako/wrapper';
import { UsersUserDataResponseBodySchema } from '@yukako/types';

export const useGetUserById = (uid: string) => {
    return useValidatedSWR(
        `/api/users/${uid}`,
        (server, token) => PassthroughWrapper(server, token).users.getById,
        UsersUserDataResponseBodySchema,
        [uid],
    );
};
