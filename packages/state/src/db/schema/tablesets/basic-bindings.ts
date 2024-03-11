import { json, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projectVersions } from '../index';

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

export const projectVersionEnvironmentBindings = pgTable(
    'project_version_environment_bindings',
    {
        id: text('id').notNull().primaryKey(),
        name: text('name').notNull(),
        envVar: text('env_var').notNull(),
        projectVersionId: text('project_version_id')
            .notNull()
            .references(() => projectVersions.id),
    },
);

export const projectVersionEnvironmentBindingRelations = relations(
    projectVersionEnvironmentBindings,
    ({ one }) => ({
        projectVersion: one(projectVersions, {
            fields: [projectVersionEnvironmentBindings.projectVersionId],
            references: [projectVersions.id],
        }),
    }),
);
