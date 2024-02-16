import { PassthroughWrapper } from '@yukako/wrapper';
import { useValidatedSWR } from '@/lib/hooks/validated-swr';
import { z } from 'zod';
import { KvKvDataResponseBodySchema } from '@yukako/types';

export const useListKvDatabases = () => {
    let KvDatabaseDataResponseBodySchema;
    return useValidatedSWR(
        '/api/kv',
        (server, token) => PassthroughWrapper(server, token).kv.list,
        z.array(KvKvDataResponseBodySchema),
        [],
    );
};
