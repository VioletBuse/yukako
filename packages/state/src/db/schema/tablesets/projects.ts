import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { projectVersions } from '../index';
import { cronJobs } from './cron-jobs';

export const projects = pgTable('projects', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql`now()`),
});

export const projectRelations = relations(projects, ({ one, many }) => ({
    projectVersions: many(projectVersions),
    cronJobs: many(cronJobs),
}));
