import {
    boolean,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';

export const yukakoNode = pgTable('yukako_nodes', {
    id: text('id').notNull().primaryKey(),
    lastOnline: timestamp('last_online').notNull().defaultNow(),
    onlineSince: timestamp('online_since').notNull().defaultNow(),
    workerCount: integer('worker_count').notNull(),
    nodeRegistrationManagerLock: boolean('node_registration_manager_lock')
        .notNull()
        .default(false),
    projectLocks: jsonb('project_locks').notNull().default('[]'),
});
