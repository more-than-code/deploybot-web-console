import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (({ cookies, url }) => {
	if (!cookies.get('accessToken') && !url.pathname.startsWith('/login')) {
		throw redirect(307, '/login');
	}
}) satisfies LayoutServerLoad;
