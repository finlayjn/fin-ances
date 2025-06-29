import { json, error } from '@sveltejs/kit';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { ORIGIN, RP_ID, JWT_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';
import type {
	AuthenticationResponseJSON,
	AuthenticatorTransportFuture
} from '@simplewebauthn/server';
import jwt from '@tsndr/cloudflare-worker-jwt';
import type { AuthChallengeJWT } from '$lib/types/auth';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	if (!platform?.env.DATABASE) return new Response('Database not configured', { status: 500 });
	const db = drizzle(platform.env.DATABASE, { schema });

	const body = (await request.json()) as { token: string; reg: AuthenticationResponseJSON };
	if (!body.token || !body.reg) return error(400, 'Token and registration response are required');

	const verifiedToken = await jwt.verify(body.token, JWT_SECRET);
	if (!verifiedToken) return error(401, 'Invalid or expired token');
	const { payload } = verifiedToken;
	const { challenge } = payload as AuthChallengeJWT;
	if (!challenge) return error(400, 'Challenge is required');

	const passkey = await db.query.passkeys.findFirst({
		where: eq(schema.passkeys.credentialId, body.reg.id),
		with: { user: true }
	});
	if (!passkey) return error(401, 'Unauthorized passkey');

	let verification;
	try {
		verification = await verifyAuthenticationResponse({
			response: body.reg,
			expectedChallenge: challenge,
			expectedOrigin: ORIGIN.split(','),
			expectedRPID: RP_ID,
			credential: {
				id: passkey.credentialId,
				publicKey: Uint8Array.from(passkey.publicKey.split(',').map(Number)),
				counter: passkey.counter,
				transports: passkey.transports.split(',') as AuthenticatorTransportFuture[]
			}
		});

		const { verified, authenticationInfo } = verification;

		if (verified) {
			await db
				.update(schema.passkeys)
				.set({
					counter: authenticationInfo.newCounter,
					lastUsedAt: Date.now()
				})
				.where(eq(schema.passkeys.credentialId, passkey.credentialId))
				.run();

			const token = await jwt.sign(
				{
					id: passkey.user.id,
					email: passkey.user.email,
					firstName: passkey.user.firstName,
					lastName: passkey.user.lastName,
					nbf: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + 60 * 60 // Expires: Now + 1 hour
				},
				JWT_SECRET
			);

			cookies.set('token', token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict'
			});

			return json({ verified });
		} else {
			return error(401, 'Not verified');
		}
	} catch (e) {
		console.error(e);
		return error(400, (e as Error).message);
	}
};
