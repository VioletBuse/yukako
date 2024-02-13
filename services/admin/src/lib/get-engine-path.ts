import path from 'path';

export const getEnginePath = () => {
    if (process.env.WORKER_PATH) {
        return process.env.WORKER_PATH;
    }

    if (process.env.WORKER_ID) {
        const wid = process.env.WORKER_ID;
        const workerPath = path.join(process.cwd(), './.yukako', wid);
        const enginePath = path.join(workerPath, './engine');
        const engineSocket = path.join(enginePath, './engine.sock');
    }

    return null;
};
