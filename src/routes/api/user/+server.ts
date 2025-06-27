import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ platform, request }) => {
	if (!platform?.env.DATABASE) return new Response('Database not configured', { status: 500 });
	const db = drizzle(platform.env.DATABASE, { schema });

	const result = await db
		.insert(schema.users)
		.values(await request.json())
		.returning()
		.all();
	return json(result);
};
