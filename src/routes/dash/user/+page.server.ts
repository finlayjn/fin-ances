import type { Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import * as schema from '$lib/server/db/schema';
import { drizzle } from 'drizzle-orm/d1';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { pageTitle: 'Create User' };
};

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		if (!data) return error(400, 'No form data provided');
		if (!event.platform?.env.DATABASE) return error(500, 'Database not configured');
		const db = drizzle(event.platform.env.DATABASE, { schema });

		const firstName = data.get('firstName')?.toString();
		const lastName = data.get('lastName')?.toString();
		const email = data.get('email')?.toString();
		const role = data.get('role')?.toString() as 'admin' | 'manager' | 'staff' | 'client' | 'none';

		if (!firstName || !lastName || !email || !role) {
			return error(400, 'All fields are required');
		}

		if (!['admin', 'manager', 'staff', 'client', 'none'].includes(role)) {
			return error(400, 'Invalid role selected');
		}

		const result = await db.insert(schema.users).values({
			firstName,
			lastName,
			email,
			role
		});

		if (!result.success) return error(500, 'Failed to create user');
		return redirect(302, `/dash/user/${result.meta.last_row_id}`);
	}
} satisfies Actions;
