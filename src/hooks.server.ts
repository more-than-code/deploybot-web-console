import type { HandleFetch, Handle } from '@sveltejs/kit';

export const handleFetch = (({ event, request, fetch }) => {
	if (request.url.includes('/api')) {
		const token = event.cookies.get('accessToken');
    request.headers.set("Authorization", `Bearer ${token}`)
	}

	return fetch(request);
}) satisfies HandleFetch;
