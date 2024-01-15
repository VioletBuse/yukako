import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as _ from 'lodash';

const isSerializableJson = (value: any): boolean => {
    try {
        const str = JSON.stringify(value);
        const parsed = JSON.parse(str);
        return _.isEqual(value, parsed);
    } catch (e) {
        return false;
    }
};

const ThrowableResponseSchema = z.object({
    __brand: z.literal('ThrowableResponse'),
    message: z.any(),
    statusCode: z.number(),
    headers: z.record(z.string()).nullish(),
});

type ThrowableResponse = {
    message: any;
    statusCode: number;
    headers: Record<string, string>;
};

const validateThrowableResponse = (
    value: unknown,
): ThrowableResponse | null => {
    try {
        const parsed = ThrowableResponseSchema.parse(value);
        let message: any = {};
        if (typeof parsed.message === 'string') {
            if (parsed.statusCode < 200 && parsed.statusCode >= 300) {
                message = { error: parsed.message };
            } else {
                message = { message: parsed.message };
            }
        } else {
            if (isSerializableJson(parsed.message)) {
                message = parsed.message;
            } else {
                throw new Error('Invalid message');
            }
        }

        let headers: Record<string, string> = {};
        if (parsed.headers) {
            headers = parsed.headers;
        }

        return {
            message,
            statusCode: parsed.statusCode,
            headers,
        };
    } catch (e) {
        return null;
    }
};

export class respond {
    private _statusCode: number = 200;
    private _headersObject: Record<string, string> = {};
    private _messageObject: any = 'Hello World!';

    private constructor() {}

    // public static new(): respond {
    //     return new respond();
    // }

    public static rethrow(err: unknown): void {
        const throwableResponse = validateThrowableResponse(err);

        if (throwableResponse) {
            throw err;
        } else {
            console.error('Not throwable response');
            console.error(err);
        }
    }

    private _status(statusCode: number): respond {
        this._statusCode = statusCode;
        return this;
    }

    public static status(statusCode: number): respond {
        return new respond()._status(statusCode);
    }

    public status(statusCode: number): respond {
        return this._status(statusCode);
    }

    private _header(key: string, value: string): respond {
        this._headersObject[key] = value;
        return this;
    }

    public static header(key: string, value: string): respond {
        return new respond()._header(key, value);
    }

    public header(key: string, value: string): respond {
        return this._header(key, value);
    }

    private _rmHeader(key: string): respond {
        delete this._headersObject[key];
        return this;
    }

    public static rmHeader(key: string): respond {
        return new respond()._rmHeader(key);
    }

    public rmHeader(key: string): respond {
        return this._rmHeader(key);
    }

    private _headers(headers: Record<string, string>): respond {
        for (const [key, value] of Object.entries(headers)) {
            this._headersObject[key] = value;
        }
        return this;
    }

    public static headers(headers: Record<string, string>): respond {
        return new respond()._headers(headers);
    }

    public headers(headers: Record<string, string>): respond {
        return this._headers(headers);
    }

    private _rmHeaders(keys: string[]): respond {
        for (const key of keys) {
            delete this._headersObject[key];
        }
        return this;
    }

    public static rmHeaders(keys: string[]): respond {
        return new respond()._rmHeaders(keys);
    }

    public rmHeaders(keys: string[]): respond {
        return this._rmHeaders(keys);
    }

    // public message(message: any): respond {
    //     this._messageObject = message;
    //     return this;
    // }

    private _message(message: any): respond {
        this._messageObject = message;
        return this;
    }

    public static message(message: any): respond {
        return new respond()._message(message);
    }

    public message(message: any): respond {
        return this._message(message);
    }

    public throw(): never {
        throw {
            __brand: 'ThrowableResponse',
            message: this._messageObject,
            statusCode: this._statusCode,
            headers: this._headersObject,
        };
    }
}

export const handleThrownError = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const throwableResponse = validateThrowableResponse(err);

    if (throwableResponse) {
        for (const [key, value] of Object.entries(throwableResponse.headers)) {
            res.setHeader(key, value);
        }

        res.status(throwableResponse.statusCode).send(
            throwableResponse.message,
        );
        return;
    } else {
        console.error('Not throwable response');
        console.error(err);
        console.log('next(err)');
        next(err);
    }
};
