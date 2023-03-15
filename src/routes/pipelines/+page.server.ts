import type { ApiResponse, Pipeline } from 'models/pipeline';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
	let pipelines: Pipeline[] = [];

	try {
		const res = await fetch('/api/pipelines', {
			method: 'GET'
		});

		if (res.status == 200) {
			const pRes: ApiResponse<Pipeline> = await res.json();
			pipelines = pRes.payload.items;
		} else {
			console.info(res.status);
		}
	} catch (e) {
		console.error(e);
	}
	return {
		pipelines
	};
}) satisfies PageServerLoad;
