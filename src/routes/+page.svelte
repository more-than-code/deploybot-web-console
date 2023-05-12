<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const user = data.user;
</script>

{#if user?.avatarUrl}
<img alt="avatar" src={user.avatarUrl} />
{/if}

<div>Hello {user?.name ?? "vsitor"}, welcome to DeployBot!</div>

{#if user}
	<a href="/projects">View projects</a>
{:else}
	<a href="/signin">Sign in</a>
{/if}
