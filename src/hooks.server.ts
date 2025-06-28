import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';

function handleUnauthorized(path: string) {
	if (path.startsWith('/api')) {
		return error(401, 'Unauthorized');
	} else {
		return redirect(302, '/signin');
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	if (path === '/signin' || path === '/register') {
		return await resolve(event);
	}

	const token = event.cookies.get('token');
	if (!token) return handleUnauthorized(path);

	const validatedToken = await jwt.verify(token, JWT_SECRET);
	if (!validatedToken) return handleUnauthorized(path);

	const { payload } = validatedToken;
	const { id } = payload as { id: number };
	event.locals.userId = id;

	return await resolve(event);
};
