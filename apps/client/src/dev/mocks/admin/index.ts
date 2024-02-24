import app from './routes';
import * as fs from 'fs-extra';
import path from 'path';
import { mockKv } from './db/kv';

let server: ReturnType<(typeof app)['listen']> | null = null;
let adminSocket: string | null = null;

export const startAdminMock = (_workerSocket: string, _adminSocket: string) => {
    if (server) {
        server.close();
    }

    const directory = path.dirname(_adminSocket);
    fs.ensureDirSync(directory);
    fs.rmSync(_adminSocket, { force: true });

    const kvDir = path.join(directory, 'kv');
    fs.ensureDirSync(kvDir);
    const kvFile = path.join(kvDir, 'kvs.json');
    fs.ensureFileSync(kvFile);
    mockKv.setKvPath(kvFile);
    mockKv.loadKvs();

    server = app.listen(_adminSocket);
    adminSocket = _adminSocket;
};

export const stopAdminMock = () => {
    if (server) {
        server.close();
    }
    if (adminSocket) {
        fs.rmSync(adminSocket, { recursive: true, force: true });
    }
};
