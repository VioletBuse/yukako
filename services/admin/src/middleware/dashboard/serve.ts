import { files } from '../../.artifacts/files';
import { Request, Response, NextFunction } from 'express';

export const serve =
    () => async (req: Request, res: Response, next: NextFunction) => {
        const pathname = req.path;

        let path = pathname;

        if (pathname === '/') {
            path = '/index.html';
        }

        if (!(path in files)) {
            path = '/index.html';
        }

        const file = files[path];

        if (!file) {
            return next();
        }

        const mimetype = file.mimetype;
        const base64 = file.base64;

        res.setHeader('Content-Type', mimetype);
        res.send(Buffer.from(base64, 'base64'));
    };
