import type { ItemsResponse } from 'models/response';
import type { Project } from 'models/projects';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
	let res = await fetch('/api/projects', {
		method: 'GET'
	});

	if (res.status == 200) {
		const projRes: ItemsResponse<Project> = await res.json().catch((e) => console.error);

		return {
			projects: projRes.payload.items
		};
	} else {
		console.info(res.status);
	}
}) satisfies PageServerLoad;
