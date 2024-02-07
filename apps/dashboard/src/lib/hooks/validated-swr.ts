import { useAuthToken, useServerUrl } from '@/lib/hooks/wrapper';
import useSWR from 'swr';
import { z } from 'zod';
import { useValidateSWRResponse } from '@/lib/hooks/hook-helpers';

export const useValidatedSWR = <
    T extends z.ZodTypeAny,
    U extends (server: string, authToken: string) => (...args: any[]) => any,
>(
    path: string,
    getFXN: U,
    schema: T,
    args: Parameters<ReturnType<U>>,
) => {
    const server = useServerUrl();
    const authToken = useAuthToken();

    const res = useSWR(
        authToken ? [path, args] : null,
        ([, _args]: [string, Parameters<ReturnType<U>>]) =>
            getFXN(server, authToken ?? '')(..._args),
    );

    return useValidateSWRResponse(schema, res);
};
