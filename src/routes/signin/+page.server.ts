import { fail, redirect, type Cookies } from '@sveltejs/kit';
import type { AuthenticationResponse } from 'models/user';
import type { Actions } from './$types';

function setCookies(cookies: Cookies, accessToken: string) {
	cookies.set('accessToken', accessToken, {
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

}

export const actions = {
	signin: async ({ cookies, request, fetch }) => {
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
			setCookies(cookies, authRes.payload.accessToken)
			throw redirect(302, '/projects');
		}
	},
	googleSignin: async ({ cookies, request, fetch }) => {
		const data = await request.formData();
		const idToken = data.get('idToken');

		const res = await fetch('/api/authenticateSso', {
			credentials: 'same-origin',
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify({
				idToken
			})
		});

		if (res.status != 200) {
			return fail(400, { invalid: true });
		}

		const authRes: AuthenticationResponse = await res.json();

		if (authRes.code === 0 && authRes.payload) {
			setCookies(cookies, authRes.payload.accessToken)
			throw redirect(302, '/projects');
		}
	}
} satisfies Actions;
