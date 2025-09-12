import type { ItemResponse, ItemsResponse } from 'models/response';
import type { Project } from 'models/projects';
import type { User } from 'models/user';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, params }) => {
	let res = await fetch('/api/project/' + params.slug, {
		method: 'GET'
	});

	if (res.status != 200) {
		console.info(res.status);
		return;
	}

	const projRes: ItemResponse<Project> = await res.json().catch(() => console.error);

	const searchParams = new URLSearchParams();

	const members = projRes?.payload?.members ?? [];
	for (const u of members) {
		searchParams.append('uid', u.userId);
	}

	res = await fetch('/api/users?' + searchParams);
	let users: User[] = [];

	if (res.status == 200) {
		const usersRes: ItemsResponse<User> = await res.json().catch(() => console.error);
		users = usersRes.payload.items;
	}

	return {
		project: projRes.payload,
		users: users
	};
}) satisfies PageServerLoad;
