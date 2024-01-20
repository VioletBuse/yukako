import { AuthWrapper } from './auth';
import { ProjectsWrapper } from './projects';

export const BaseWrapper = (server: string, sessionId: string) => ({
    auth: AuthWrapper(server),
    projects: ProjectsWrapper(server, sessionId),
});

export const WrapperWithoutSession = (server: string) => ({
    auth: AuthWrapper(server),
});

export const Wrapper = <T extends string | undefined = undefined>(
    server: string,
    sessionId?: T,
): T extends string
    ? ReturnType<typeof BaseWrapper>
    : ReturnType<typeof WrapperWithoutSession> => {
    const url = new URL(server);
    const protocol = url.protocol;
    const hostname = url.host;

    const serverString = `${protocol}//${hostname}`;

    if (sessionId) {
        return BaseWrapper(serverString, sessionId) as any;
    } else {
        return WrapperWithoutSession(serverString) as any;
    }
};
