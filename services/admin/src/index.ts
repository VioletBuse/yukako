import app from './controllers';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs-extra';
import express from 'express';

let server: http.Server | null = null;

export const AdminService = {
    start: (workerId: string) => {
        const workerPath = path.join(process.cwd(), './.yukako', workerId);
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
