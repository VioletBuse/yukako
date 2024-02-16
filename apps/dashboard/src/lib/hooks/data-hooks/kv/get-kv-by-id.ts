import { useValidatedSWR } from '@/lib/hooks/validated-swr';
import { PassthroughWrapper } from '@yukako/wrapper';
import { KvKvDataResponseBodySchema } from '@yukako/types';

export const useGetKvById = (id: string) => {
    return useValidatedSWR(
        `/api/kv/${id}`,
        (server, token) => PassthroughWrapper(server, token).kv.getById,
        KvKvDataResponseBodySchema,
        [id],
    );
};
