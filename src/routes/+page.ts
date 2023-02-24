import type { ApiResponse, Pipeline } from 'src/models/pipeline';
import type { PageLoad } from './$types';

export const load = (async ({fetch, params }) => {
  const res = await fetch(import.meta.env.VITE_PIPELINE_ENDPOINT);
  const pRes: ApiResponse<Pipeline> = await res.json();

  return {
      pipelines: pRes.payload.items
  };
}) satisfies PageLoad;