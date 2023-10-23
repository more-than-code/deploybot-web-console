import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		proxy: {
			'/api': {
				target: 'https://console.deploybot.dev',
				changeOrigin: true,
			},
			// '/api': {
			// 	target: 'http://localhost:8090/',
			// 	changeOrigin: true,
			// 	rewrite: path => path.replace(/^\/api/, '')
			// }
		},
	},
};

export default config;
