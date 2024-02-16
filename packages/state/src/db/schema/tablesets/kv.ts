import {
    index,
    pgTable,
    primaryKey,
    text,
    timestamp,
    unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projectVersions } from './versions';

export const kvDatabase = pgTable('kv_database', {
    id: text('id').notNull().primaryKey(),
    name: text('name').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const kvDatabaseRelations = relations(kvDatabase, ({ many }) => ({
    projectVersionBindings: many(projectVersionKvDatabaseBinding),
    entries: many(kvEntry),
}));

export const kvEntry = pgTable(
    'kv_entry',
    {
        key: text('key').notNull(),
        value: text('value').notNull(),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow(),
        kvDatabaseId: text('kv_database_id')
            .notNull()
            .references(() => kvDatabase.id),
    },
    (table) => ({
        compositePrimaryKey: primaryKey({
            columns: [table.key, table.kvDatabaseId],
        }),
        keyIsUnique: unique('kv_entry_key_unique').on(
            table.key,
            table.kvDatabaseId,
        ),
        keyDatabaseIndex: index('kv_entry_key_database_index').on(table.key),
        valueDatabaseIndex: index('kv_entry_value_database_index').on(
            table.value,
        ),
    }),
);

export const kvEntryRelations = relations(kvEntry, ({ one }) => ({
    kvDatabase: one(kvDatabase, {
        fields: [kvEntry.kvDatabaseId],
        references: [kvDatabase.id],
    }),
}));

export const projectVersionKvDatabaseBinding = pgTable(
    'project_version_kv_database_binding',
    {
        kvDatabaseId: text('kv_database_id')
            .notNull()
            .references(() => kvDatabase.id),
        projectVersionId: text('project_version_id')
            .notNull()
            .references(() => projectVersions.id),
        name: text('name').notNull(),
    },
    (table) => ({
        pk: primaryKey({
            columns: [table.kvDatabaseId, table.projectVersionId],
        }),
    }),
);

export const projectVersionKvDatabaseBindingRelations = relations(
    projectVersionKvDatabaseBinding,
    ({ one }) => ({
        kvDatabase: one(kvDatabase, {
            fields: [projectVersionKvDatabaseBinding.kvDatabaseId],
            references: [kvDatabase.id],
        }),
        projectVersion: one(projectVersions, {
            fields: [projectVersionKvDatabaseBinding.projectVersionId],
            references: [projectVersions.id],
        }),
    }),
);
