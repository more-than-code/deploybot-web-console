<script lang="ts">
	import { onMount } from 'svelte';
	import { SubmitViaForm } from '$lib/shared/utils/utils';

	let gLoginBtn;
	let email = '';
	let password = '';

	onMount(async () => {
		addGoogleSigninButton();
	});

	function handleCredentialResponse(response) {
		SubmitViaForm('?/googleSignin', 'POST', { idToken: response.credential });
	}

	function addGoogleSigninButton() {
		if (window.google) {
			window.google.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: handleCredentialResponse
			});
			window.google.accounts.id.renderButton(gLoginBtn, {
				type: 'standard',
				theme: 'outline',
				size: 'large'
			});
		}
	}
</script>

<svelte:head>
	<script
		src="https://accounts.google.com/gsi/client"
		async
		defer
		on:load={addGoogleSigninButton}
	></script>
</svelte:head>

<div class="loginWrapper">
	<form method="POST" action="?/signin">
		<label>
			Email
			<input placeholder="" name="email" type="email" bind:value={email} />
		</label>
		<div class="padding5" />
		<label>
			Password
			<input placeholder="" name="password" type="password" bind:value={password} />
		</label>
		<div class="padding10" />
		<button class="loginBtn" disabled={ email.length === 0 || password.length === 0}>Sign in</button>
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

	.loginBtn[disabled] {
		background-color: #aaa;
		cursor: not-allowed;
	}

	.gLoginBtn {
		width: 200px;
	}
</style>
