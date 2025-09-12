import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

// vitest/vite typing mismatch; allow the any cast here
/* eslint-disable @typescript-eslint/no-explicit-any */
export default defineConfig({
	// vitest's vite types differ from local vite types; cast plugin to any to avoid overload mismatch
	plugins: [sveltekit()] as any,
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
/* eslint-enable @typescript-eslint/no-explicit-any */
