import { sqliteTable, integer, text, primaryKey, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// MARK: Users
export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	email: text('email').notNull().unique(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	tokenHash: text('token_hash'),
	tokenExpiration: integer('token_expiration'),
	role: text('role', {
		enum: ['admin', 'manager', 'staff', 'client', 'none'],
		mode: 'text'
	})
		.notNull()
		.default('none'),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const usersRelations = relations(users, ({ many }) => ({
	passkeys: many(passkeys),
	clients: many(usersToClients)
}));

// MARK: Passkeys
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

// MARK: Clients
export const clients = sqliteTable('clients', {
	id: integer('id').primaryKey(),
	name: text('name').notNull()
});

export const clientsRelations = relations(clients, ({ many }) => ({
	users: many(usersToClients)
}));

// MARK: UsersToClients
export const usersToClients = sqliteTable(
	'users_to_clients',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		clientId: integer('client_id')
			.notNull()
			.references(() => clients.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at')
			.notNull()
			.$defaultFn(() => Date.now())
	},
	(t) => [primaryKey({ columns: [t.userId, t.clientId] })]
);

export const usersToClientsRelations = relations(usersToClients, ({ one }) => ({
	user: one(users, {
		fields: [usersToClients.userId],
		references: [users.id]
	}),
	client: one(clients, {
		fields: [usersToClients.clientId],
		references: [clients.id]
	})
}));

// MARK: Products
export const products = sqliteTable('products', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	unitPrice: integer('unit_price').notNull(),
	minimumQuantity: real('minimum_quantity'),
	increment: real('increment').notNull().default(1.0),
	unit: text('unit', {
		enum: ['minute', 'hour', 'day', 'week', 'month', 'year', 'each'],
		mode: 'text'
	})
		.notNull()
		.default('each'),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const productsRelations = relations(products, ({ many }) => ({
	timesheetEntries: many(timesheetEntries)
}));

// MARK: Timesheets
export const timesheets = sqliteTable('timesheets', {
	id: integer('id').primaryKey(),
	startDate: text('start_date'),
	endDate: text('end_date'),
	clientId: integer('client_id')
		.notNull()
		.references(() => clients.id, { onDelete: 'cascade' }),
	projectId: integer('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'set null' }),
	name: text('name').notNull(),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const timesheetsRelations = relations(timesheets, ({ one, many }) => ({
	client: one(clients, {
		fields: [timesheets.clientId],
		references: [clients.id]
	}),
	project: one(projects, {
		fields: [timesheets.projectId],
		references: [projects.id]
	}),
	entries: many(timesheetEntries)
}));

// MARK: Timesheet Entries
export const timesheetEntries = sqliteTable('timesheet_entries', {
	id: integer('id').primaryKey(),
	timesheetId: integer('timesheet_id')
		.notNull()
		.references(() => timesheets.id, { onDelete: 'cascade' }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' }),
	productId: integer('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'set null' }),
	startTime: integer('start_time').notNull(),
	endTime: integer('end_time').notNull(),
	description: text('description'),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const timesheetEntriesRelations = relations(timesheetEntries, ({ one }) => ({
	timesheet: one(timesheets, {
		fields: [timesheetEntries.timesheetId],
		references: [timesheets.id]
	}),
	user: one(users, {
		fields: [timesheetEntries.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [timesheetEntries.productId],
		references: [products.id]
	})
}));

// MARK: Projects
export const projects = sqliteTable('projects', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	clientId: integer('client_id')
		.notNull()
		.references(() => clients.id, { onDelete: 'cascade' }),
	startDate: text('start_date'),
	endDate: text('end_date'),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const projectsRelations = relations(projects, ({ many }) => ({
	timesheets: many(timesheets),
	invoices: many(invoices)
}));

// MARK: Invoices
export const invoices = sqliteTable('invoices', {
	id: integer('id').primaryKey(),
	clientId: integer('client_id')
		.notNull()
		.references(() => clients.id, { onDelete: 'cascade' }),
	projectId: integer('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'set null' }),
	totalAmount: integer('total_amount').notNull(),
	status: text('status', {
		enum: ['draft', 'sent', 'paid', 'cancelled'],
		mode: 'text'
	}).notNull(),
	dueDate: text('due_date'),
	notes: text('notes'),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
	client: one(clients, {
		fields: [invoices.clientId],
		references: [clients.id]
	}),
	project: one(projects, {
		fields: [invoices.projectId],
		references: [projects.id]
	})
}));

// MARK: Invoice Items
export const invoiceItems = sqliteTable('invoice_items', {
	id: integer('id').primaryKey(),
	invoiceId: integer('invoice_id')
		.notNull()
		.references(() => invoices.id, { onDelete: 'cascade' }),
	productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
	timesheetId: integer('timesheet_id').references(() => timesheets.id, { onDelete: 'set null' }),
	showTimesheet: integer('show_timesheet', {
		mode: 'boolean'
	})
		.notNull()
		.default(true),
	name: text('name').notNull(),
	description: text('description'),
	quantity: real('quantity').notNull().default(1.0),
	increment: real('increment').notNull().default(1.0),
	unitPrice: integer('unit_price').notNull(),
	unit: text('unit', {
		enum: ['minute', 'hour', 'day', 'week', 'month', 'year', 'each'],
		mode: 'text'
	})
		.notNull()
		.default('each'),
	total: integer('total').notNull(),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
	invoice: one(invoices, {
		fields: [invoiceItems.invoiceId],
		references: [invoices.id]
	}),
	product: one(products, {
		fields: [invoiceItems.productId],
		references: [products.id]
	}),
	timesheet: one(timesheets, {
		fields: [invoiceItems.timesheetId],
		references: [timesheets.id]
	})
}));

// MARK: Invoice History
export const invoiceHistory = sqliteTable('invoice_history', {
	id: integer('id').primaryKey(),
	invoiceId: integer('invoice_id')
		.notNull()
		.references(() => invoices.id, { onDelete: 'cascade' }),
	status: text('status', {
		enum: ['draft', 'sent', 'paid', 'cancelled'],
		mode: 'text'
	}).notNull(),
	date: text('date'),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const invoiceHistoryRelations = relations(invoiceHistory, ({ one }) => ({
	invoice: one(invoices, {
		fields: [invoiceHistory.invoiceId],
		references: [invoices.id]
	})
}));
