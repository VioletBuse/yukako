import * as qs from 'qs';

export const qss = (params: any) => {
    return qs.stringify(params, {
        strictNullHandling: true,
    });
};
