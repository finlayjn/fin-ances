import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { users } from '$lib/server/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

type UserPayload = InferSelectModel<typeof users>;

function handleUnauthorized(path: string, event: RequestEvent) {
	event.cookies.delete('token', { path: '/' });
	if (path.startsWith('/api')) {
		return error(401, 'Unauthorized');
	} else {
		return redirect(302, '/auth/signin');
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	if (path === '/auth/signin' || path === '/auth/register') {
		return await resolve(event);
	}

	const token = event.cookies.get('token');
	if (!token) return handleUnauthorized(path, event);

	const validatedToken = await jwt.verify(token, JWT_SECRET);
	if (!validatedToken) return handleUnauthorized(path, event);

	const { payload } = validatedToken;
	const { id, email, firstName, lastName } = payload as UserPayload;
	event.locals.user = {
		id,
		email,
		firstName: firstName || undefined,
		lastName: lastName || undefined
	};

	return await resolve(event);
};
