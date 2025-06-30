import { generateRegistrationOptions } from '@simplewebauthn/server';
import { isNotNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { compare } from 'bcrypt-ts';
import type { PageServerLoad } from './$types';
import { RP_NAME, RP_ID, JWT_SECRET } from '$env/static/private';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import jwt from '@tsndr/cloudflare-worker-jwt';
import type { AuthChallengeJWT } from '$lib/types/auth';

export const load: PageServerLoad = async ({ platform, url }) => {
	if (!platform?.env.DATABASE) throw new Error('Database not configured');
	const db = drizzle(platform.env.DATABASE, { schema });

	const token = url.searchParams.get('token');
	if (!token) return {};

	const users = await db.query.users.findMany({
		where: isNotNull(schema.users.tokenHash) && isNotNull(schema.users.tokenExpiration),
		columns: {
			id: true,
			email: true,
			tokenHash: true,
			tokenExpiration: true
		},
		with: {
			passkeys: {
				columns: {
					credentialId: true,
					transports: true
				}
			}
		}
	});

	for (const user of users) {
		if ((await compare(token, user.tokenHash!)) && user.tokenExpiration! > Date.now()) {
			const options = await generateRegistrationOptions({
				rpName: RP_NAME,
				rpID: RP_ID,
				userName: user.email,
				attestationType: 'none',
				excludeCredentials: user.passkeys.map((pk) => ({
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
					challenge: options.challenge,
					webauthnId: options.user.id,
					userId: user.id,
					nbf: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + 5 * 60 // Expires: Now + 5m
				} as AuthChallengeJWT,
				JWT_SECRET
			);

			return { options, token };
		}
	}

	return {};
};
