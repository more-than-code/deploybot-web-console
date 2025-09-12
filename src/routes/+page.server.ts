import type { ItemResponse } from 'models/response';
import type { User } from 'models/user';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
	const res = await fetch('/api/user', {
		method: 'GET'
	});

	if (res.status == 200) {
		const projRes: ItemResponse<User> = await res.json().catch(() => console.error);

		return {
			user: projRes.payload
		};
	} else {
		console.info(res.status);
	}
}) satisfies PageServerLoad;
