import {
    boolean,
    integer,
    json,
    pgEnum,
    pgTable,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const users = pgTable('users', {
    id: text('id').notNull().primaryKey(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql`now()`),
});

export const userRelations = relations(users, ({ many, one }) => ({
    sessions: many(sessions),
    createdNewUserTokens: many(newUserTokens, {
        relationName: 'createdBy',
    }),
    createdFromToken: one(newUserTokens, {
        fields: [users.id],
        references: [newUserTokens.newUserId],
        relationName: 'newUser',
    }),
}));

export const sessions = pgTable('sessions', {
    id: text('id').notNull().primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql`now()`),
    valid: boolean('valid').notNull().default(true),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const newUserTokens = pgTable('new_user_tokens', {
    id: text('id').notNull().primaryKey(),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql`now()`),
    createdById: text('created_by')
        .notNull()
        .references(() => users.id),
    newUserId: text('new_user_id')
        .unique()
        .references(() => users.id),
    valid: boolean('valid').notNull().default(true),
});

export const newUserTokenRelations = relations(newUserTokens, ({ one }) => ({
    createdBy: one(users, {
        fields: [newUserTokens.createdById],
        references: [users.id],
        relationName: 'createdBy',
    }),
    newUser: one(users, {
        fields: [newUserTokens.newUserId],
        references: [users.id],
        relationName: 'newUser',
    }),
}));

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

export const projectVersionTextBindings = pgTable(
    'project_version_text_bindings',
    {
        id: text('id').notNull().primaryKey(),
        name: text('name').notNull(),
        value: text('value').notNull(),
        projectVersionId: text('project_version_id')
            .notNull()
            .references(() => projectVersions.id),
    },
);

export const projectVersionTextBindingRelations = relations(
    projectVersionTextBindings,
    ({ one }) => ({
        projectVersion: one(projectVersions, {
            fields: [projectVersionTextBindings.projectVersionId],
            references: [projectVersions.id],
        }),
    }),
);

export const projectVersionJsonBindings = pgTable(
    'project_version_json_bindings',
    {
        id: text('id').notNull().primaryKey(),
        name: text('name').notNull(),
        value: json('value').notNull(),
        projectVersionId: text('project_version_id')
            .notNull()
            .references(() => projectVersions.id),
    },
);

export const projectVersionJsonBindingRelations = relations(
    projectVersionJsonBindings,
    ({ one }) => ({
        projectVersion: one(projectVersions, {
            fields: [projectVersionJsonBindings.projectVersionId],
            references: [projectVersions.id],
        }),
    }),
);

export const projectVersionDataBindings = pgTable(
    'project_version_data_bindings',
    {
        id: text('id').notNull().primaryKey(),
        name: text('name').notNull(),
        base64: text('base64').notNull(),
        projectVersionId: text('project_version_id')
            .notNull()
            .references(() => projectVersions.id),
    },
);

export const projectVersionDataBindingRelations = relations(
    projectVersionDataBindings,
    ({ one }) => ({
        projectVersion: one(projectVersions, {
            fields: [projectVersionDataBindings.projectVersionId],
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
    }),
);

export const projects = pgTable('projects', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql`now()`),
});

export const projectRelations = relations(projects, ({ one, many }) => ({
    projectVersions: many(projectVersions),
}));
