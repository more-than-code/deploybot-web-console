<script lang="ts">
	import { Button, FormGroup, TextInput } from 'carbon-components-svelte';
  import { CustomMap } from '$lib/types/customMap';
	import type { BuildConfig } from 'models/pipeline';

	export let config: BuildConfig;

	let configArgsList = Array.from(config.args);

	$: {
		config.args = new CustomMap<string, string>(configArgsList.map(([key, value]) => [key, value]));
	}

	function handleAddArg() {
		configArgsList = [...configArgsList, ['', '']];
	}

	function handleRemoveArg(elem: string[]) {
		configArgsList = configArgsList.filter((configArgsList) => configArgsList[0] !== elem[0]);
	}
</script>

<FormGroup legendText="Image Name">
	<TextInput bind:value={config.imageName} placeholder="Please input image name" />
</FormGroup>
<FormGroup legendText="Image Tag">
	<TextInput bind:value={config.imageTag} placeholder="Please input image tag" />
</FormGroup>
<FormGroup legendText="Dockerfile">
	<TextInput bind:value={config.dockerfile} placeholder="Please input dockerfile" />
</FormGroup>
<FormGroup legendText="Repo Url">
	<TextInput bind:value={config.repoUrl} placeholder="Please input repo url" />
</FormGroup>
<FormGroup legendText="Repo Name">
	<TextInput bind:value={config.repoName} placeholder="Please input repo name" />
</FormGroup>
<FormGroup legendText="Repo Branch">
	<TextInput bind:value={config.repoBranch} placeholder="Please input repo branch" />
</FormGroup>
<FormGroup legendText="Args">
	{#each configArgsList as elem}
		<div class="env-item">
			<TextInput
				bind:value={elem[0]}
				placeholder="Please input arg name"
				style="margin-right: 10px;"
			/>
			<TextInput
				bind:value={elem[1]}
				placeholder="Please input arg value"
				style="margin-right: 10px;"
			/>
			<Button kind="danger-tertiary" size="small" on:click={() => handleRemoveArg(elem)}
				>Remove
			</Button>
		</div>
	{/each}
	<Button kind="tertiary" on:click={handleAddArg}>Add</Button>
</FormGroup>

<style>
	.env-item {
		display: flex;
		margin-bottom: 10px;
	}
</style>
