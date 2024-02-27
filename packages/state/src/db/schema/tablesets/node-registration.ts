import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const yukakoNode = pgTable('yukako_nodes', {
    id: text('id').notNull().primaryKey(),
    lastOnline: timestamp('last_online').notNull().defaultNow(),
    onlineSince: timestamp('online_since').notNull().defaultNow(),
});
