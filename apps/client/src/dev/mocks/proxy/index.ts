import * as http from 'http';
import httpProxy from 'http-proxy';
import { IncomingMessage, OutgoingMessage, Server, ServerResponse } from 'http';

let server: ReturnType<(typeof httpProxy)['createProxyServer']> | null = null;

export const startProxyMock = (
    workerSocket: string,
    adminSocket: string,
    port: number,
) => {
    if (server) {
        server.close();
    }

    server = httpProxy
        .createProxyServer({
            // @ts-ignore
            target: {
                socketPath: workerSocket,
            },
            ws: true,
        })
        .listen(port);
};

export const stopProxyMock = () => {
    if (server) {
        server.close();
    }
};
