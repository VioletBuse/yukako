import {
    jsonb,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';
import { projectVersions } from './versions';
import { relations } from 'drizzle-orm';

export const cronJobs = pgTable('cron_jobs', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    cron: text('cron').notNull(),
});

export const cronJobRelations = relations(cronJobs, ({ many }) => ({
    bindings: many(cronJobBindings),
    logs: many(cronJobLogs),
}));

export const cronJobBindings = pgTable(
    'cron_job_bindings',
    {
        cronJobId: text('cron_job_id')
            .notNull()
            .references(() => cronJobs.id),
        projectVersionId: text('project_version_id')
            .notNull()
            .references(() => projectVersions.id),
    },
    (table) => ({
        pkey: primaryKey({
            columns: [table.cronJobId, table.projectVersionId],
        }),
    }),
);

export const cronJobBindingRelations = relations(
    cronJobBindings,
    ({ one }) => ({
        cronJob: one(cronJobs, {
            fields: [cronJobBindings.cronJobId],
            references: [cronJobs.id],
        }),
        projectVersion: one(projectVersions, {
            fields: [cronJobBindings.projectVersionId],
            references: [projectVersions.id],
        }),
    }),
);

export const cronJobStatuses = pgEnum('cron_job_status', [
    'scheduled',
    'running',
    'completed',
]);

export const cronJobLogs = pgTable('cron_job_logs', {
    id: text('id').notNull().primaryKey(),
    cronJobId: text('cron_job_id')
        .notNull()
        .references(() => cronJobs.id),
    scheduledAt: timestamp('scheduled_at').notNull(),
    status: cronJobStatuses('status').notNull(),
    result: jsonb('result').default(null),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    ranAt: timestamp('ran_at'),
    completedAt: timestamp('completed_at'),
});

export const cronJobLogRelations = relations(cronJobLogs, ({ one }) => ({
    cronJob: one(cronJobs, {
        fields: [cronJobLogs.cronJobId],
        references: [cronJobs.id],
    }),
}));
