// import { useLocation } from 'wouter';
// import { useAuthToken, useServerUrl } from '@/lib/hooks/wrapper';
import {
    UsersUserDataResponseBodySchema,
    // UsersUserDataResponseBodyType,
} from '@yukako/types';
import { PassthroughWrapper } from '@yukako/wrapper';
// import { useEffect, useState } from 'react';
// import useSWR from 'swr';
// import { useValidateSWRResponse } from '@/lib/hooks/hook-helpers';
import { z } from 'zod';
import { useValidatedSWR } from '@/lib/hooks/validated-swr';

// type Response = { mutate: () => void } & (
//     | {
//           data: UsersUserDataResponseBodyType;
//           error: null;
//           loading: false;
//       }
//     | {
//           data: null;
//           error: string;
//           loading: false;
//       }
//     | {
//           data: null;
//           error: null;
//           loading: true;
//       }
// );

// export const useUsers = () => {
//     const [, setLocation] = useLocation();
//
//     const authToken = useAuthToken();
//     const server = useServerUrl();
//
//     const [wrapper, _setWrapper] = useState(() =>
//         PassthroughWrapper(server, authToken ?? ''),
//     );
//
//     useEffect(() => {
//         _setWrapper(PassthroughWrapper(server, authToken ?? ''));
//     }, [authToken, server, _setWrapper]);
//
//     const res = useSWR(authToken ? '/api/users' : null, () =>
//         wrapper.users.list(),
//     );
//
//     if (!authToken) {
//         setLocation('/auth');
//     }
//
//     return useValidateSWRResponse(
//         z.array(UsersUserDataResponseBodySchema),
//         res,
//     );
// };

export const useUsers = () => {
    return useValidatedSWR(
        '/api/users',
        (server, authToken) => PassthroughWrapper(server, authToken).users.list,
        z.array(UsersUserDataResponseBodySchema),
        [],
    );
};
