<script lang="ts">
	import { Button, FormGroup, MultiSelect, TextArea, TextInput } from 'carbon-components-svelte';
	import type { DeployConfig } from 'models/pipeline';
	import { CustomMap } from '$lib/types/customMap';

	export let config: DeployConfig;
	export let availNetworkList: [string, string][];

	let volumeMountList = Array.from(config.volumeMounts ?? new CustomMap<string, string>());
	let fileList = Array.from(config.files ?? new CustomMap<string, string>());
	let portList = Array.from(config.ports ?? new CustomMap<string, string>());
	let networkList = Array.from(config.networks ?? new CustomMap<string, string>());
	let envList = Array.from(config.env ?? []);
	let restartPolicy =
		typeof config.restartPolicy === 'object' ? config.restartPolicy : { name: '' } ?? { name: '' };
	let selectedNetworkIds: string[] = (function () {
		let ids: string[] = [];

		for (let i = 0; i < availNetworkList.length; i++) {
			if (networkList.find((e) => e[1] === availNetworkList[i][1]) !== undefined) {
				ids.push(i + '');
			}
		}

		return ids;
	})();

	$: {
		config.env = envList.filter((e) => e !== '');

		config.volumeMounts = new CustomMap<string, string>(
			volumeMountList.map(([key, value]) => [key, value])
		);

		config.files = new CustomMap<string, string>(fileList.map(([key, value]) => [key, value]));

		config.ports = new CustomMap<string, string>(portList.map(([key, value]) => [key, value]));

		config.networks = new CustomMap<string, string>(
			networkList.map(([key, value]) => [key, value])
		);

		config.restartPolicy = restartPolicy;
	}

	$: {
		networkList = [];
		for (const id of selectedNetworkIds) {
			networkList.push(availNetworkList[parseInt(id)]);
		}
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

<FormGroup legendText={`Networks - ${networkList.map((e) => e[0])}`}>
	<MultiSelect
		bind:selectedIds={selectedNetworkIds}
		label="Select network(s)"
		items={availNetworkList.map(([name, id], i) => ({
			id: i + '',
			text: `Name: ${name}; Id: ${id}`
		}))}
	/>
</FormGroup>

<FormGroup legendText="Command">
	<TextInput bind:value={config.command} placeholder="Please input command" />
</FormGroup>

<style>
	.env-item {
		display: flex;
		margin-bottom: 10px;
	}
</style>
