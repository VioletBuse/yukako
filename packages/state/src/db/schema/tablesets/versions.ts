import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { projects } from './projects';
import {
    projectVersionDataBindings,
    projectVersionJsonBindings,
    projectVersionTextBindings,
} from './basic-bindings';
import { projectVersionKvDatabaseBinding } from './kv';
import { sites } from './sites';
import { cronJobBindings } from './cron-jobs';

export const dataBlobType = pgEnum('data_blob_type', [
    'esmodule',
    'wasm',
    'json',
    'text',
    'data',
]);

export const dataBlobs = pgTable('data_blobs', {
    id: text('id').notNull().primaryKey(),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql`now()`),
    data: text('data').notNull(),
    filename: text('filename').notNull(),
    type: dataBlobType('type').notNull(),
});

export const dataBlobRelations = relations(dataBlobs, ({ many }) => ({
    projectVersionBlobs: many(projectVersionBlobs),
}));

export const projectVersionBlobs = pgTable('project_version_blobs', {
    id: text('id').notNull().primaryKey(),
    blobId: text('blob_id')
        .notNull()
        .references(() => dataBlobs.id),
    projectVersionId: text('project_version_id')
        .notNull()
        .references(() => projectVersions.id),
    order: integer('order').notNull(),
});

export const projectVersionBlobRelations = relations(
    projectVersionBlobs,
    ({ one }) => ({
        blob: one(dataBlobs, {
            fields: [projectVersionBlobs.blobId],
            references: [dataBlobs.id],
        }),
        projectVersion: one(projectVersions, {
            fields: [projectVersionBlobs.projectVersionId],
            references: [projectVersions.id],
        }),
    }),
);

export const projectVersionRoutes = pgTable('project_version_routes', {
    id: text('id').notNull().primaryKey(),
    projectVersionId: text('project_version_id')
        .notNull()
        .references(() => projectVersions.id),
    host: text('host').notNull(),
    basePaths: text('base_paths').array().notNull(),
});

export const projectVersionRouteRelations = relations(
    projectVersionRoutes,
    ({ one }) => ({
        projectVersion: one(projectVersions, {
            fields: [projectVersionRoutes.projectVersionId],
            references: [projectVersions.id],
        }),
    }),
);

export const projectVersions = pgTable('project_versions', {
    id: text('id').notNull().primaryKey(),
    projectId: text('project_id')
        .notNull()
        .references(() => projects.id),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql`now()`),
    version: integer('version').notNull(),
});

export const projectVersionRelations = relations(
    projectVersions,
    ({ one, many }) => ({
        project: one(projects, {
            fields: [projectVersions.projectId],
            references: [projects.id],
        }),
        projectVersionBlobs: many(projectVersionBlobs),
        routes: many(projectVersionRoutes),
        textBindings: many(projectVersionTextBindings),
        jsonBindings: many(projectVersionJsonBindings),
        dataBindings: many(projectVersionDataBindings),
        kvDatabases: many(projectVersionKvDatabaseBinding),
        sites: many(sites),
        cronJobBindings: many(cronJobBindings),
    }),
);
