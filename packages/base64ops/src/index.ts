import { createHash } from 'crypto';

export const base64ToBuffer = (base64: string): Buffer => {
    const buffer = Buffer.from(base64, 'base64');
    return buffer;
};

export const base64ToDataView = (base64: string): DataView => {
    const buffer = base64ToBuffer(base64);
    return new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const base64Hash = (base64: string): string => {
    const buffer = base64ToBuffer(base64);
    const hash = createHash('sha256').update(buffer).digest('hex');

    return hash;
};
