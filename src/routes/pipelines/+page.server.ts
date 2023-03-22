import type { Pipeline } from 'models/pipeline';
import type { ItemsResponse } from 'models/response';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, url }) => {
	try {
		const res = await fetch('/api/pipelines?pid=' + url.searchParams.get('pid'), {
			method: 'GET'
		});

		if (res.status == 200) {
			const pRes: ItemsResponse<Pipeline> = await res.json();

			return {
				pipelines: pRes.payload.items
			};
		} else {
			console.info(res.status);
		}
	} catch (e) {
		console.error(e);
	}
}) satisfies PageServerLoad;
