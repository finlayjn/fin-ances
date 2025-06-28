import type { PageServerLoad } from './$types';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { RP_ID, JWT_SECRET } from '$env/static/private';
import jwt from '@tsndr/cloudflare-worker-jwt';

export const load: PageServerLoad = async () => {
	const options = await generateAuthenticationOptions({
		timeout: 60000,
		userVerification: 'preferred',
		rpID: RP_ID
	});

	const token = await jwt.sign(
		{
			challenge: options.challenge,
			nbf: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 5 * 60 // Expires: Now + 5m
		},
		JWT_SECRET
	);

	return { options, token };
};
