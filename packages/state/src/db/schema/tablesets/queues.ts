import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { projectVersions } from './versions';
import { relations } from 'drizzle-orm';

export const queues = pgTable('queues', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const queueRelations = relations(queues, ({ many }) => ({
    bindings: many(projectVersionQueueBindings),
}));

export const projectVersionQueueBindings = pgTable(
    'project_version_queue_bindings',
    {
        queueId: text('queue_id')
            .notNull()
            .references(() => queues.id),
        projectVersionId: text('project_version_id')
            .notNull()
            .references(() => projectVersions.id),
        name: text('name').notNull(),
    },
    (table) => ({
        compositePk: primaryKey({
            columns: [table.queueId, table.projectVersionId],
        }),
    }),
);

export const queueBindingRelations = relations(
    projectVersionQueueBindings,
    ({ one }) => ({
        queue: one(queues, {
            fields: [projectVersionQueueBindings.queueId],
            references: [queues.id],
        }),
        projectVersion: one(projectVersions, {
            fields: [projectVersionQueueBindings.projectVersionId],
            references: [projectVersions.id],
        }),
    }),
);

export const queueJob = pgTable('queue_jobs', {
    id: text('id').notNull().primaryKey(),
    queueId: text('queue_id')
        .notNull()
        .references(() => queues.id),
    data: text('data').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
});

export const queueJobRelations = relations(queueJob, ({ one }) => ({
    queue: one(queues, {
        fields: [queueJob.queueId],
        references: [queues.id],
    }),
}));
