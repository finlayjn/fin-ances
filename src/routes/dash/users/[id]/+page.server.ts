import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { hash } from 'bcrypt-ts';
import { generateRandomPassword } from '$lib/helpers/generateRandomPassword';

export const load: PageServerLoad = async ({ platform, params }) => {
	if (!platform?.env.DATABASE) throw error(500, 'Database not configured');
	const id = Number(params.id);
	if (!id) throw error(400, 'Request must include an ID');
	const db = drizzle(platform.env.DATABASE, { schema });
	const user = await db.query.users.findFirst({
		where: eq(schema.users.id, id),
		columns: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			tokenExpiration: true
		},
		with: {
			passkeys: {
				columns: {
					id: true,
					createdAt: true,
					lastUsedAt: true,
					webauthnUserId: true
				}
			}
		}
	});
	if (!user) throw error(404, 'User not found');
	return { user, pageTitle: 'Edit User' };
};

import type { Actions } from './$types';

export const actions = {
	update: async (event) => {
		if (!event.platform?.env.DATABASE) throw error(500, 'Database not configured');
		const db = drizzle(event.platform.env.DATABASE, { schema });

		const id = Number(event.params.id);
		if (!id) throw fail(400, { message: 'Request must include an ID' });

		const body = await event.request.formData();
		const firstName = body.get('firstName')?.toString();
		const lastName = body.get('lastName')?.toString();
		const role = body.get('role')?.toString() as 'admin' | 'manager' | 'staff' | 'client' | 'none';

		const existingUser = await db.query.users.findFirst({
			where: eq(schema.users.id, id)
		});
		if (!existingUser) return fail(404, { message: 'User not found' });

		const result = await db
			.update(schema.users)
			.set({
				firstName,
				lastName,
				role,
				updatedAt: Date.now()
			})
			.where(eq(schema.users.id, id));

		if (!result.success) throw error(500, 'Failed to update user');
		return { success: true, message: 'User updated successfully', action: 'update' };
	},
	token: async (event) => {
		if (!event.platform?.env.DATABASE) throw error(500, 'Database not configured');
		const db = drizzle(event.platform.env.DATABASE, { schema });

		const id = Number(event.params.id);
		if (!id) throw fail(400, { message: 'Request must include an ID' });

		const existingUser = await db.query.users.findFirst({
			where: eq(schema.users.id, id)
		});
		if (!existingUser) return fail(404, { message: 'User not found' });

		const body = await event.request.formData();
		const invalidate = body.get('invalidate')?.toString();
		if (invalidate === 'true') {
			const result = await db
				.update(schema.users)
				.set({ tokenHash: null, tokenExpiration: null })
				.where(eq(schema.users.id, id));

			if (!result.success) throw error(500, 'Failed to invalidate user token');
			return {
				success: true,
				message: 'User token invalidated successfully',
				invalidated: true,
				action: 'token'
			};
		}

		const password = generateRandomPassword();
		const tokenHash = await hash(password, 10);
		const tokenExpiration = Date.now() + 3 * 24 * 60 * 60 * 1000;

		const result = await db
			.update(schema.users)
			.set({ tokenHash, tokenExpiration })
			.where(eq(schema.users.id, id));

		if (!result.success) throw error(500, 'Failed to update user token');
		return { success: true, message: 'User token updated successfully', password, action: 'token' };
	}
} satisfies Actions;
