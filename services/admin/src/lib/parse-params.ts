import { Request } from 'express';
import * as qs from 'qs';

export const parseParams = <T extends any>(req: Request): T => {
    const url = new URL(req.url, 'http://dummy.kv');
    const result = qs.parse(url.search, {
        ignoreQueryPrefix: true,
        strictNullHandling: true,
    }) as T;
    console.log('search', decodeURIComponent(url.search));
    console.log('params', result);

    return result;
};
