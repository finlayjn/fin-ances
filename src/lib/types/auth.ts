export type AuthChallengeJWT = {
	challenge?: string;
	userId?: number;
	webauthnId?: string;
	token?: string;
	nbf: number;
	exp: number;
};
