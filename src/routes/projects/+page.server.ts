import type { ApiResponse } from 'models/response';
import type { Project } from 'models/projects';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
	let projects: Project[] = [];

	let res = await fetch('/api/projects', {
		method: 'GET'
	});

	if (res.status == 200) {
		const projRes: ApiResponse<Project> = await res.json().catch((e) => console.error);
		projects = projRes.payload.items;
	} else {
		console.info(res.status);
	}

	return {
		projects
	};
}) satisfies PageServerLoad;
