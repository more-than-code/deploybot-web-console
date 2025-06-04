<script lang="ts">
	import { CustomMap } from '$lib/types/customMap';
	import { Button, FormGroup, MultiSelect, TextArea, TextInput } from 'carbon-components-svelte';
	import type { DeployConfig } from 'models/pipeline';

	export let config: DeployConfig;
	export let availNetworkList: [string, string][];

	let volumeMountList = Array.from(config.volumeMounts ?? new CustomMap<string, string>());
	let fileList = Array.from(config.files ?? new CustomMap<string, string>());
	let portList = Array.from(config.ports ?? new CustomMap<string, string>());
	let envList = Array.from(config.env ?? []);
	let linkList = Array.from(config.links ?? []);
	let restartPolicy =
		typeof config.restartPolicy === 'object' ? config.restartPolicy : { name: '' };
	let selectedNetworkNameIds: string[] = Array.from(
		config.networks ?? new CustomMap<string, string>()
	).map(([name, id]) => `${name}:${id}`);

	$: {
		config.env = envList.filter((e) => e !== '');
		config.links = linkList.filter((e) => e !== '');

		config.volumeMounts = new CustomMap<string, string>(
			volumeMountList.map(([key, value]) => [key, value])
		);

		config.files = new CustomMap<string, string>(fileList.map(([key, value]) => [key, value]));

		config.ports = new CustomMap<string, string>(portList.map(([key, value]) => [key, value]));

		const networkList = [];
		for (const nameId of selectedNetworkNameIds) {
			const [name, id] = nameId.split(':');
			networkList.push([name, id]);
		}

		config.networks = new CustomMap<string, string>(
			networkList.map(([key, value]) => [key, value])
		);

		config.restartPolicy = restartPolicy;
	}

	function handleAddEnv() {
		if (!config) return;

		envList = [...envList, ''];
	}

	function handleRemoveEnv(i: number) {
		if (!config) return;

		envList.splice(i, 1);
		envList = envList;
	}

	function handleAddLink() {
		if (!config) return;

		linkList = [...linkList, ''];
	}

	function handleRemoveLink(i: number) {
		if (!config) return;

		linkList.splice(i, 1);
		linkList = linkList;
	}

	function handleAddFile() {
		fileList = [...fileList, ['', '']];
	}

	function handleRemoveFile(elem: string[]) {
		fileList = fileList.filter((file) => file[0] !== elem[0]);
	}

	function handleAddVolumeMount() {
		volumeMountList = [...volumeMountList, ['', '']];
	}

	function handleRemoveVolumeMount(elem: string[]) {
		volumeMountList = volumeMountList.filter((volumeMount) => volumeMount[0] !== elem[0]);
	}

	function handleAddPort() {
		portList = [...portList, ['', '']];
	}

	function handleRemovePort(elem: string[]) {
		portList = portList.filter((port) => port[0] !== elem[0]);
	}
</script>

<FormGroup legendText="Image Name">
	<TextInput bind:value={config.imageName} placeholder="Please input image name" />
</FormGroup>
<FormGroup legendText="Image Tag">
	<TextInput bind:value={config.imageTag} placeholder="Please input image tag" />
</FormGroup>
<FormGroup legendText="Service Name">
	<TextInput bind:value={config.serviceName} placeholder="Please input service name" />
</FormGroup>
<FormGroup legendText="Restart Policy">
	<TextInput bind:value={restartPolicy.name} placeholder="Please input name" />
	<TextInput
		bind:value={restartPolicy.maximumRetryCount}
		placeholder="Please input maximum retry count"
	/>
</FormGroup>
<FormGroup legendText="Env">
	{#each envList as env, i}
		<div class="env-item">
			<TextInput
				bind:value={env}
				placeholder="Please input env,ex: key=value"
				style="margin-right: 10px;"
			/>
			<Button kind="danger-tertiary" size="small" on:click={() => handleRemoveEnv(i)}
				>Remove
			</Button>
		</div>
	{/each}
	<Button kind="tertiary" on:click={handleAddEnv}>Add</Button>
</FormGroup>
<FormGroup legendText="Volume Mounts">
	{#each volumeMountList as elem}
		<div class="env-item">
			<TextInput
				bind:value={elem[0]}
				placeholder="Please input mount source"
				style="margin-right: 10px;"
			/>
			<TextInput
				bind:value={elem[1]}
				placeholder="Please input mount target"
				style="margin-right: 10px;"
			/>
			<Button kind="danger-tertiary" size="small" on:click={() => handleRemoveVolumeMount(elem)}
				>Remove
			</Button>
		</div>
	{/each}
	<Button kind="tertiary" on:click={handleAddVolumeMount}>Add</Button>
</FormGroup>
<FormGroup legendText="Files">
	{#each fileList as file}
		<div class="env-item">
			<TextInput
				bind:value={file[0]}
				placeholder="Please input path/filename"
				style="margin-right: 10px;"
			/>
			<TextArea
				bind:value={file[1]}
				placeholder="Please input content"
				style="margin-right: 10px;"
			/>
			<Button kind="danger-tertiary" size="small" on:click={() => handleRemoveFile(file)}
				>Remove
			</Button>
		</div>
	{/each}
	<Button kind="tertiary" on:click={handleAddFile}>Add</Button>
</FormGroup>
<FormGroup legendText="Ports">
	{#each portList as elem}
		<div class="env-item">
			<TextInput
				bind:value={elem[0]}
				placeholder="Please input exposed port"
				style="margin-right: 10px;"
			/>
			<TextInput
				bind:value={elem[1]}
				placeholder="Please input host port"
				style="margin-right: 10px;"
			/>
			<Button kind="danger-tertiary" size="small" on:click={() => handleRemovePort(elem)}
				>Remove
			</Button>
		</div>
	{/each}
	<Button kind="tertiary" on:click={handleAddPort}>Add</Button>
</FormGroup>

<FormGroup legendText={`Networks: ${selectedNetworkNameIds.map((e) => e.split(':')[0])}`}>
	<MultiSelect
		bind:selectedIds={selectedNetworkNameIds}
		label="Select"
		helperText="Select Webhook Host first to see available networks."
		items={availNetworkList.map(([name, id]) => ({
			id: `${name}:${id}`,
			text: `${name}:${id}`
		}))}
	/>
</FormGroup>

<FormGroup legendText="Command">
	<TextInput bind:value={config.command} placeholder="Please input command" />
</FormGroup>

<FormGroup legendText="Links">
	{#each linkList as env, i}
		<div class="env-item">
			<TextInput
				bind:value={env}
				placeholder="Please input env,ex: key:value"
				style="margin-right: 10px;"
			/>
			<Button kind="danger-tertiary" size="small" on:click={() => handleRemoveLink(i)}
				>Remove
			</Button>
		</div>
	{/each}
	<Button kind="tertiary" on:click={handleAddLink}>Add</Button>
</FormGroup>

<style>
	.env-item {
		display: flex;
		margin-bottom: 10px;
	}
</style>
