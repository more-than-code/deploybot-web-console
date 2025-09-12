import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: 'https://console.deploybot.dev',
				changeOrigin: true
			}
			// '/api': {
			// 	target: 'http://localhost:8090/',
			// 	changeOrigin: true,
			// 	rewrite: path => path.replace(/^\/api/, '')
			// }
		}
	}
});
