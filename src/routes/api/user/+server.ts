import { drizzle } from 'drizzle-orm/d1';
import type { InferInsertModel } from 'drizzle-orm';
import * as schema from '$lib/server/db/schema';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { hash } from 'bcrypt-ts';
import { generateRandomPassword } from '$lib/helpers/generateRandomPassword';

export const GET: RequestHandler = async ({ locals }) => {
	return json({ userId: locals.userId }, { status: 200 });
};

export const POST: RequestHandler = async ({ platform, request }) => {
	if (!platform?.env.DATABASE) return new Response('Database not configured', { status: 500 });
	const db = drizzle(platform.env.DATABASE, { schema });

	const body = (await request.json()) as InferInsertModel<typeof schema.users>;
	const password = generateRandomPassword();
	body.tokenHash = await hash(password, 10);
	body.tokenExpiration = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days

	const result = await db.insert(schema.users).values(body).returning().all();
	return json({ user: result, password }, { status: 201 });
};
