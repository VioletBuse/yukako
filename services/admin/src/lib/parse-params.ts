import { Request } from 'express';
import * as qs from 'qs';

export const parseParams = <T extends any>(req: Request): T => {
    const url = new URL(req.url, 'http://dummy.kv');
    return qs.parse(url.search, { ignoreQueryPrefix: true }) as T;
};
