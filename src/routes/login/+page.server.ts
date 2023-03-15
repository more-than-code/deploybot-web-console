import { fail, redirect } from '@sveltejs/kit';
import type { AuthenticationResponse } from 'models/user';
import type { Action, Actions, PageServerLoad } from './$types';

export const actions = {
	default: async ({ cookies, request, fetch }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
			return fail(400, { invalid: true });
		}

		const res = await fetch('/api/authenticate', {
			credentials: 'same-origin',
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify({
				email,
				password
			})
		});

    if (res.status != 200) {
      return fail(400, { invalid: true });
    }

		const authRes: AuthenticationResponse = await res.json();

		if (authRes.code === 0 && authRes.payload) {
			cookies.set('accessToken', authRes.payload.accessToken, {
				// send cookie for every page
				path: '/',
				// server side only cookie so you can't use `document.cookie`
				httpOnly: true,
				// only requests from same site can send cookies
				// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
				sameSite: 'strict',
				// only sent over HTTPS in production
				secure: process.env.NODE_ENV === 'production',
				// set cookie to expire after a month
				maxAge: 60 * 60 * 24 * 30
			});

			throw redirect(302, '/pipelines');
		}
	}
} satisfies Actions;