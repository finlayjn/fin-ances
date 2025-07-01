import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ platform, params }) => {
	if (!platform?.env.DATABASE) return error(500, 'Database not configured');
	const userId = Number(params.id);
	const passkeyId = Number(params.passkeyId);
	if (!userId || !passkeyId) return error(400, 'Request must include an ID');
	const db = drizzle(platform.env.DATABASE, { schema });
	const result = await db
		.delete(schema.passkeys)
		.where(eq(schema.passkeys.userId, userId) && eq(schema.passkeys.id, passkeyId));
	if (result.success) return new Response(null, { status: 204 });
	else return error(500, 'Failed to delete user');
};
