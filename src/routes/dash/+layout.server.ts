import type { LayoutServerLoad } from './$types';
import { TITLE, SUBTITLE } from '$env/static/private';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) return { user: null };

	return { user: locals.user, title: TITLE, subtitle: SUBTITLE };
};
