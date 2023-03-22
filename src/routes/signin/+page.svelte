<script lang="ts">
	import { onMount } from 'svelte';
	import { SubmitViaForm } from '$lib/shared/utils/utils';
	import type { PageData } from './$types';
	import { VITE_GOOGLE_CLIENT_ID } from '$env/static/private';


	let gLoginBtn;

	onMount(async () => {
		async function handleCredentialResponse(response) {
			SubmitViaForm('?/googleSignin', 'POST', { idToken: response.credential });
		}

		window.google.accounts.id.initialize({
			client_id: VITE_GOOGLE_CLIENT_ID,
			callback: handleCredentialResponse
		});
		window.google.accounts.id.renderButton(gLoginBtn, {
			type: 'standard',
			theme: 'outline',
			size: 'large'
		});
	});
</script>

<svelte:head>
	<script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>

<div class="loginWrapper">
	<form method="POST" action="?/signin">
		<label>
			Email
			<input placeholder="" name="email" type="email" />
		</label>
		<div class="padding5" />
		<label>
			Password
			<input placeholder="" name="password" type="password" />
		</label>
		<div class="padding10" />
		<button class="loginBtn">Sign in</button>
	</form>
	<div class="padding20" />
	<div class="gLoginBtn" id="gLoginBtn" bind:this={gLoginBtn} />
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	input {
		display: block;
		width: 200px;
	}

	.loginWrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	input {
		box-sizing: border-box;
		height: 40px;
		padding: 0;
		font-size: 16px;
	}

	.padding5 {
		width: 5px;
		height: 5px;
	}

	.padding10 {
		width: 10px;
		height: 10px;
	}

	.padding20 {
		width: 20px;
		height: 20px;
	}

	.loginBtn {
		border: 0;
		padding: 0;
		background-color: #333;
		width: 200px;
		height: 40px;
		border-radius: 4px;
		color: #fff;
	}

	.gLoginBtn {
		width: 200px;
	}
</style>
