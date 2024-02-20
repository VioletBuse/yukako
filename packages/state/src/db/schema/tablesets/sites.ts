import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { projectVersions } from './versions';
import { relations } from 'drizzle-orm';

export const sites = pgTable('sites', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    versionId: text('version_id')
        .notNull()
        .references(() => projectVersions.id),
});

export const sitesRelations = relations(sites, ({ one, many }) => ({
    version: one(projectVersions, {
        fields: [sites.versionId],
        references: [projectVersions.id],
    }),
    files: many(siteFiles),
}));

export const siteFiles = pgTable('site_files', {
    id: text('id').notNull().primaryKey(),
    base64: text('base64').notNull(),
    siteId: text('site_id')
        .notNull()
        .references(() => sites.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const siteFilesRelations = relations(siteFiles, ({ one }) => ({
    site: one(sites, {
        fields: [siteFiles.siteId],
        references: [sites.id],
    }),
}));
