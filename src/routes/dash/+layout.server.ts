import type { LayoutServerLoad } from './$types';
import { TITLE, SUBTITLE } from '$env/static/private';

export const load: LayoutServerLoad = async ({ locals }) => {
	const links = [
		{ href: '/dash', label: 'Dashboard' },
		{ href: '/dash/invoices', label: 'Invoices' },
		{ href: '/dash/products', label: 'Products' },
		{ href: '/dash/timesheets', label: 'Timesheets' },
		{ href: '/dash/projects', label: 'Projects' },
		{ href: '/dash/clients', label: 'Clients' },
		{ href: '/dash/users', label: 'Users' },
		{ href: '/dash/settings', label: 'Settings' }
	];

	return {
		currentUser: locals.user,
		appTitle: TITLE,
		appSubtitle: SUBTITLE,
		navigation: links
	};
};
