import * as fs from 'fs-extra';
import * as prexit from 'prexit';
import { z } from 'zod';
import * as nodePath from 'path';

let path = nodePath.join(process.cwd(), './.yukako_cli/admin/kv/kvs.json');
let kvs: Record<string, Record<string, string | null>> = {};

export const mockKv = {
    get: (kvId: string, keys: string[]): (string | null)[] => {
        return keys.map((key) => kvs[kvId][key] || null);
    },
    put: (kvId: string, data: Record<string, string | null>): void => {
        if (!kvs[kvId]) {
            kvs[kvId] = {};
        }

        Object.entries(data).forEach(([key, value]) => {
            kvs[kvId][key] = value;
        });
    },
    delete: (kvId: string, keys: string[]): void => {
        keys.forEach((key) => {
            delete kvs[kvId][key];
        });
    },
    list: (
        kvId: string,
        limit: number,
        cursor: string,
        opts: {
            prefix: string;
            suffix: string;
            includes: string;
            excludes: string;
        },
    ): string[] => {
        let entries = Object.entries(kvs[kvId] || {});

        if (opts.prefix) {
            entries = entries.filter(([key]) => key.startsWith(opts.prefix));
        }

        if (opts.suffix) {
            entries = entries.filter(([key]) => key.endsWith(opts.suffix));
        }

        if (opts.includes) {
            entries = entries.filter(([key]) => key.includes(opts.includes));
        }

        if (opts.excludes) {
            entries = entries.filter(([key]) => !key.includes(opts.excludes));
        }

        if (cursor) {
            const index = entries.findIndex(([key]) => key === cursor);
            entries = entries.slice(index + 1);
        }

        entries = entries.slice(0, limit);

        return entries.map(([key]) => key);
    },
    resetKv: (kvId: string) => {
        kvs[kvId] = {};
    },
    setKvPath: (_path: string) => {
        path = _path;
    },
    loadKvs: () => {
        const exists = fs.existsSync(path);
        if (exists) {
            try {
                const data = fs.readJsonSync(path);
                const schema = z.record(z.record(z.string().nullable()));
                kvs = schema.parse(data);
            } catch (e) {
                console.error('kvs.json malformed. resetting');
                kvs = {};
                mockKv.serializeKvs();
            }
        } else {
            console.log('Kv does not exist, creating new one.');
        }
    },
    serializeKvs: () => {
        fs.writeJsonSync(path, kvs);
    },
};
