import { json, error } from '@sveltejs/kit';
import { verifyRegistrationResponse, generateRegistrationOptions } from '@simplewebauthn/server';
import { isNotNull, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { compare } from 'bcrypt-ts';
import type { RequestHandler } from './$types';
import { RP_NAME, RP_ID, ORIGIN, JWT_SECRET } from '$env/static/private';
import type {
	RegistrationResponseJSON,
	VerifiedRegistrationResponse,
	AuthenticatorTransportFuture
} from '@simplewebauthn/server';
import jwt from '@tsndr/cloudflare-worker-jwt';
import type { AuthChallengeJWT } from '$lib/types/auth';

export const GET: RequestHandler = async ({ platform, url }) => {
	if (!platform?.env.DATABASE) return new Response('Database not configured', { status: 500 });
	const db = drizzle(platform.env.DATABASE, { schema });

	const token = url.searchParams.get('token');
	if (!token) return error(400, 'Token is required');

	const users = await db
		.select()
		.from(schema.users)
		.where(isNotNull(schema.users.tokenHash) && isNotNull(schema.users.tokenExpiration))
		.all();

	for (const user of users) {
		if ((await compare(token, user.tokenHash!)) && user.tokenExpiration! > Date.now()) {
			const userPasskeys = await db
				.select()
				.from(schema.passkeys)
				.where(eq(schema.passkeys.userId, user.id))
				.all();

			const optionsJSON = await generateRegistrationOptions({
				rpName: RP_NAME,
				rpID: RP_ID,
				userName: user.email,
				attestationType: 'none',
				excludeCredentials: userPasskeys.map((pk) => ({
					id: pk.credentialId,
					transports: pk.transports.split(',') as AuthenticatorTransportFuture[]
				})),
				authenticatorSelection: {
					residentKey: 'required',
					userVerification: 'preferred',
					authenticatorAttachment: 'platform'
				}
			});

			const token = await jwt.sign(
				{
					challenge: optionsJSON.challenge,
					webauthnId: optionsJSON.user.id,
					userId: user.id,
					nbf: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + 5 * 60 // Expires: Now + 5m
				} as AuthChallengeJWT,
				JWT_SECRET
			);

			return json({ optionsJSON, token });
		}
	}

	return json({ error: 'Invalid token or token expired' }, { status: 401 });
};

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
