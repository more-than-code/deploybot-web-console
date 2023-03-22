import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (({ cookies, url }) => {
	if (!cookies.get('accessToken')) {
		if (url.pathname === "/") {
			return;
		}

		if (url.pathname.startsWith('/signin')) {
			return;
		}

		throw redirect(307, '/signin');
	}
}) satisfies LayoutServerLoad;
