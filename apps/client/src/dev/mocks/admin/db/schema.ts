import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const devKvEntry = sqliteTable(
    'dev_kv_entry',
    {
        kvId: text('kv_id').notNull(),
        key: text('key').notNull(),
        value: text('value').notNull(),
        createdAt: text('created_at').notNull(),
    },
    (table) => ({
        primaryKey: primaryKey({ columns: [table.kvId, table.key] }),
    }),
);
