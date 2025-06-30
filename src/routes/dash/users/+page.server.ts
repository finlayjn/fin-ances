import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DATABASE) return new Response('Database not configured', { status: 500 });
	const db = drizzle(platform.env.DATABASE, { schema });

	const users = await db.query.users.findMany({
		columns: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true
		},
		with: {
			passkeys: {
				columns: {
					lastUsedAt: true
				}
			},
			clients: {
				with: {
					client: {
						columns: {
							name: true
						}
					}
				}
			}
		}
	});

	const formattedUsers = users.map((user) => {
		const lastLoginTimestamp = user.passkeys.reduce((latest, passkey) => {
			if (!passkey.lastUsedAt) return latest;
			return latest > passkey.lastUsedAt ? latest : passkey.lastUsedAt;
		}, 0);

		return {
			...user,
			passkeys: undefined,
			clients: undefined,
			lastLogin: lastLoginTimestamp ? new Date(lastLoginTimestamp).toLocaleString() : 'Never',
			clientNames: user.clients.map((client) => client.client.name).join(', ')
		};
	});

	return {
		users: formattedUsers,
		pageTitle: 'Users',
		actionText: 'New User',
		actionHref: '/dash/user'
	};
};
