import {
    boolean,
    foreignKey,
    jsonb,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';

export const cronJobs = pgTable(
    'cron_jobs',
    {
        name: text('name').notNull(),
        cron: text('cron').notNull(),
        enabled: boolean('enabled').notNull().default(true),
        projectId: text('project_id')
            .notNull()
            .references(() => projects.id),
    },
    (table) => ({
        pkey: primaryKey({ columns: [table.name, table.projectId] }),
    }),
);

export const cronJobRelations = relations(cronJobs, ({ many, one }) => ({
    logs: many(cronJobLogs),
    project: one(projects, {
        fields: [cronJobs.projectId],
        references: [projects.id],
    }),
}));

export const cronJobStatuses = pgEnum('cron_job_status', [
    'scheduled',
    'running',
    'completed',
]);

export const cronJobLogs = pgTable(
    'cron_job_logs',
    {
        id: text('id').notNull().primaryKey(),
        cronJobName: text('cron_job_name').notNull(),
        cronJobProjectId: text('cron_job_project_id').notNull(),
        scheduledAt: timestamp('scheduled_at').notNull(),
        status: cronJobStatuses('status').notNull(),
        result: jsonb('result').default(null),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        ranAt: timestamp('ran_at'),
        completedAt: timestamp('completed_at'),
    },
    (table) => ({
        cronJobFkey: foreignKey({
            columns: [table.cronJobName, table.cronJobProjectId],
            foreignColumns: [cronJobs.name, cronJobs.projectId],
            name: 'cron_job_logs_cron_job_fkey',
        }),
    }),
);

export const cronJobLogRelations = relations(cronJobLogs, ({ one }) => ({
    cronJob: one(cronJobs, {
        fields: [cronJobLogs.cronJobName, cronJobLogs.cronJobProjectId],
        references: [cronJobs.name, cronJobs.projectId],
    }),
}));
