import app from './controllers';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs-extra';
import express from 'express';
import { run } from '@yukako/cli';

let server: http.Server | null = null;

export const AdminService = {
    start: (workerId: string) => {
        const cli = run();

        const workerPath = path.join(cli.directory, workerId);
        const adminPath = path.join(workerPath, './admin');
        const adminSocket = path.join(adminPath, './admin.sock');

        process.env.WORKER_PATH = workerPath;
        process.env.WORKER_ID = workerId;

        fs.ensureDirSync(adminPath);
        fs.rmSync(adminSocket, { force: true });

        server = app.listen(adminSocket, () => {
            console.log(`Admin server listening on ${adminSocket}`);
        });
    },
    stop: () => {
        server?.close();
    },
};
