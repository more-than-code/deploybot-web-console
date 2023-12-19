import { type HandleFetch, redirect } from '@sveltejs/kit'

export const handleFetch: HandleFetch = (async ({ event, request, fetch }) => {
  if (request.url.includes('/api')) {
    const token = event.cookies.get('accessToken')
    request.headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(request)
  if (res.status == 401) {
    throw redirect(307, '/signin')
  }

  return res
})