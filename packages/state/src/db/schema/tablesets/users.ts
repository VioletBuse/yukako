import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
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
