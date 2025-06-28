import { json, error } from '@sveltejs/kit';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { RP_ID, ORIGIN, JWT_SECRET } from '$env/static/private';
import type {
	RegistrationResponseJSON,
	VerifiedRegistrationResponse
} from '@simplewebauthn/server';
import jwt from '@tsndr/cloudflare-worker-jwt';
import type { AuthChallengeJWT } from '$lib/types/auth';

export const POST: RequestHandler = async ({ platform, request }) => {
	if (!platform?.env?.DATABASE) throw new Error('Database environment variable not set');
	const db = drizzle(platform.env.DATABASE, { schema });
	const body: { reg: RegistrationResponseJSON; token: string } = await request.json();

	const verifiedToken = await jwt.verify(body.token, JWT_SECRET);
	if (!verifiedToken) return error(401, 'Invalid or expired token');
	const { payload } = verifiedToken;
	const { challenge, webauthnId, userId } = payload as AuthChallengeJWT;
	if (!challenge || !webauthnId || !userId) return error(401, 'Invalid token payload');

	const user = await db.query.users.findFirst({
		where: eq(schema.users.id, userId)
	});

	if (!user) return error(401, 'User not found');

	if (user?.tokenExpiration && user.tokenExpiration < Date.now()) {
		return error(401, 'Access code expired');
	}

	let verification: VerifiedRegistrationResponse;
	try {
		verification = await verifyRegistrationResponse({
			response: body.reg,
			expectedChallenge: challenge,
			expectedOrigin: ORIGIN,
			expectedRPID: RP_ID
		});

		const { verified, registrationInfo } = verification;

		if (!verified || !registrationInfo) return error(400, 'Registration verification failed');
		const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
		await db.insert(schema.passkeys).values({
			credentialId: credential.id,
			userId: user.id,
			publicKey: String(credential.publicKey),
			webauthnUserId: webauthnId,
			counter: credential.counter,
			transports: (credential.transports ?? []).join(','),
			deviceType: credentialDeviceType,
			backedUp: credentialBackedUp
		});

		await db
			.update(schema.users)
			.set({
				tokenHash: null,
				tokenExpiration: null
			})
			.where(eq(schema.users.id, user.id));

		return json({ verified });
	} catch (e) {
		console.error(e);
		return error(400, 'Invalid registration response');
	}
};
