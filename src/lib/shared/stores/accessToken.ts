import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = '';

const initialValue = browser ? window.localStorage.getItem('accessToken') ?? defaultValue : defaultValue;

const accessToken = writable<string>(initialValue);

accessToken.subscribe((value) => {
	if (browser) {
		window.localStorage.setItem('theme', value);
	}
});

export default accessToken