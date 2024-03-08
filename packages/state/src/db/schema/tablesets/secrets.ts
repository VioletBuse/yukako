import {
    boolean,
    foreignKey,
    pgTable,
    primaryKey,
    text,
    timestamp,
    unique,
} from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { relations } from 'drizzle-orm';
import { projectVersions } from './versions';

export const secrets = pgTable(
    'secrets',
    {
        name: text('name').notNull(),
        projectId: text('projectId')
            .notNull()
            .references(() => projects.id),
        value: text('value').notNull(),
        disabled: boolean('disabled').notNull().default(false),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({
        composite_primarykey: primaryKey({
            columns: [table.name, table.projectId],
        }),
    }),
);

export const secretRelations = relations(secrets, ({ one, many }) => ({
    project: one(projects, {
        fields: [secrets.projectId],
        references: [projects.id],
    }),
    bindings: many(secretBindings),
}));

export const secretBindings = pgTable(
    'secret_bindings',
    {
        id: text('id').notNull().primaryKey(),
        secretName: text('secret_name').notNull(),
        secretProjectId: text('secret_project_id').notNull(),
        versionId: text('version_id')
            .notNull()
            .references(() => projects.id),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({
        uniqueConstraint: unique().on(table.secretName, table.secretProjectId),
        secretFk: foreignKey({
            columns: [table.secretName, table.secretProjectId],
            foreignColumns: [secrets.name, secrets.projectId],
        }),
    }),
);

export const secretBindingRelations = relations(secretBindings, ({ one }) => ({
    secret: one(secrets, {
        fields: [secretBindings.secretName, secretBindings.secretProjectId],
        references: [secrets.name, secrets.projectId],
    }),
    projectVersion: one(projectVersions, {
        fields: [secretBindings.versionId],
        references: [projectVersions.id],
    }),
}));
