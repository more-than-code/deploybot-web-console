import type {  Pipeline } from 'models/pipeline';
import type { ApiResponse } from 'models/response';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch, url }) => {
	let pipelines: Pipeline[] = [];

	try {
		const res = await fetch('/api/pipelines?pid='+url.searchParams.get("pid"), {
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
