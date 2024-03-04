import {
    boolean,
    pgTable,
    primaryKey,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { relations } from 'drizzle-orm';
import { projectVersions } from './versions';

export const secrets = pgTable(
    'secrets',
    {
        name: text('name'),
        projectId: text('projectId').references(() => projects.id),
        value: text('value'),
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

export const secretBindings = pgTable('secret_bindings', {
    id: text('id').notNull().primaryKey(),
    secretName: text('secret_name')
        .notNull()
        .references(() => secrets.name),
    secretProjectId: text('secret_project_id')
        .notNull()
        .references(() => secrets.projectId),
    versionId: text('version_id')
        .notNull()
        .references(() => projects.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

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
