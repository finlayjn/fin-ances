import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	email: text('email').notNull().unique(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	tokenHash: text('token_hash'),
	tokenExpiration: integer('token_expiration'),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const usersRelations = relations(users, ({ many }) => ({
	passkeys: many(passkeys)
}));

export const passkeys = sqliteTable('passkeys', {
	id: integer('id').primaryKey(),
	credentialId: text('credential_id').notNull().unique(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	publicKey: text('public_key').notNull(),
	webauthnUserId: text('webauthn_user_id').notNull(),
	counter: integer('counter').notNull(),
	deviceType: text('device_type').notNull(),
	backedUp: integer('backed_up', {
		mode: 'boolean'
	}).notNull(),
	transports: text('transports').notNull(),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	lastUsedAt: integer('last_used_at')
});

export const passkeysRelations = relations(passkeys, ({ one }) => ({
	user: one(users, {
		fields: [passkeys.userId],
		references: [users.id]
	})
}));
