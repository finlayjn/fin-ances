import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	email: text('email').notNull().unique(),
	firstName: text('first_name'),
	lastName: text('last_name')
});
