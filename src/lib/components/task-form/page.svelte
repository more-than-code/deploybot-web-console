<script lang="ts">
	import {
		Checkbox,
		Dropdown,
		FormGroup,
		Loading,
		Modal,
		RadioButton,
		RadioButtonGroup,
		TextArea,
		TextInput,
		Toggle
	} from 'carbon-components-svelte';
	import type { BuildConfig, DeployConfig, Task } from 'models/pipeline';
	import type { TaskModalReq, TaskPayload } from 'models/task';
	import type { ItemResponse } from 'models/response';
	import { transformCamelCase } from '$lib/shared/utils/utils';
	import { CustomMap } from '$lib/types/customMap';
	import BuildConfigForm from './buildConfig.svelte';
	import DeployConfigForm from './deployConfig.svelte';
	import type { Server } from 'models/projects';

	enum TaskType {
		BUILD = 'build',
		DEPLOY = 'deploy'
	}

	export let open = false;
	export let taskModalReq: TaskModalReq | undefined;
	export let buildServers: Server[];
	export let deployServers: Server[];

	let task: Task | undefined;
	let buildConfig: BuildConfig | undefined;
	let deployConfig: DeployConfig | undefined;
	let configRawJson: string;
	let isLoading = false;
	let isRawJsonEditingMode = false;
	let selectedServerId = '0';
	let selectedServer: Server;

	$: {
		taskModalReq && getTask();
	}

	$: {
		if (task) {
			const i = parseInt(selectedServerId);

			if (task.type === TaskType.BUILD) {
				if (i >= 0 && i < buildServers?.length) {
					selectedServer = buildServers[i];
				}
			} else {
				if (i >= 0 && i < deployServers?.length) {
					selectedServer = deployServers[i];

					task.logUrl = `https://${selectedServer.host}:${selectedServer.port}/serviceLogs?name=${
						(task.config as DeployConfig).serviceName
					}`;
				}
			}

			if (selectedServer) {
				task.streamWebhook = `https://${selectedServer.host}:${selectedServer.port}/streamWebhook`;
			}
		}
	}

	async function getTask() {
		if (!taskModalReq || isLoading) return;

		if (!taskModalReq.id) {
			task = {
				type: TaskType.BUILD
			};

			handleTypeChange(task.type);
			return;
		}

		isLoading = true;
		const res: Response = await fetch(
			`/api/task?pid=${taskModalReq.pipelineId}&id=${taskModalReq.id}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${taskModalReq.accessToken}`
				}
			}
		);

		if (res.status !== 200) {
			isLoading = false;
			return;
		}

		const taskRes: ItemResponse<TaskPayload> = JSON.parse(await res.text(), (key, value) => {
			if (
				typeof value === 'object' &&
				value !== null &&
				['args', 'volumeMounts', 'files', 'ports', 'networks'].includes(key)
			) {
				return CustomMap.fromJSON(value);
			}
			return value;
		});

		task = taskRes.payload.Task;

		if (task.type === '') {
			task.type = task.name?.includes(TaskType.BUILD) ? TaskType.BUILD : TaskType.DEPLOY;
		}

		if (task.type.toLowerCase() === TaskType.BUILD) {
			task.type = TaskType.BUILD;
			buildConfig = transformCamelCase(task.config as BuildConfig);
		} else {
			task.type = TaskType.DEPLOY;
			deployConfig = deployConfig ?? (task.config as DeployConfig);
			deployConfig = transformCamelCase(deployConfig);
		}

		isLoading = false;
	}

	function handleCancel() {
		open = false;
		taskModalReq = undefined;
		buildConfig = undefined;
		deployConfig = undefined;
		task = undefined;
		configRawJson = '';
		isRawJsonEditingMode = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!taskModalReq || !task || isLoading) return;

		isLoading = true;

		if (isRawJsonEditingMode && configRawJson !== '') {
			task = JSON.parse(configRawJson);
		}

		const res: Response = await fetch(`/api/task`, {
			method: task?.id ? 'PATCH' : 'POST',
			headers: {
				Authorization: `Bearer ${taskModalReq.accessToken}`
			},
			body: JSON.stringify({
				id: task?.id,
				pipelineId: taskModalReq.pipelineId,
				task: {
					...task,
					config: task?.type === TaskType.BUILD ? buildConfig : deployConfig
				}
			})
		});

		if (res.status !== 200) {
			isLoading = false;
			return;
		}

		window.location.reload();
	}

	function handleTypeChange(type: string) {
		if (!task) return;

		if (type === TaskType.BUILD) {
			deployConfig = undefined;
			buildConfig = {};
		} else {
			buildConfig = undefined;
			deployConfig = {};
		}
	}

	function handleJsonEditingModeChange(e: Event) {
		if ((e.target as HTMLInputElement)?.checked) {
			const { createdAt, updatedAt, stoppedAt, executedAt, ...rest } = { ...task };
			configRawJson = JSON.stringify(rest, null, '\t');
		} else {
			task = JSON.parse(configRawJson);
		}
	}
</script>

<Modal
	preventCloseOnClickOutside
	shouldSubmitOnEnter={false}
	bind:open
	modalHeading="Modify Task"
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
	on:click:button--secondary={handleCancel}
	on:submit={handleSubmit}
	on:close={handleCancel}
>
	<Loading active={isLoading} />

	<Toggle
		labelText="Enable Raw JSON Editing Mode"
		bind:toggled={isRawJsonEditingMode}
		on:change={handleJsonEditingModeChange}
	/>
	<hr />
	{#if task}
		{#if isRawJsonEditingMode}
			<TextArea bind:value={configRawJson} />
		{:else}
			<FormGroup legendText="Target Server">
				<Dropdown
					bind:selectedId={selectedServerId}
					label="Select"
					items={task.type === TaskType.BUILD
						? buildServers?.map((e, i) => {
								return { id: i + '', text: `Name: ${e.name}; Host:${e.host}; Port:${e.port}` };
						  })
						: deployServers?.map((e, i) => {
								return { id: i + '', text: `Name: ${e.name}; Host:${e.host}; Port:${e.port}` };
						  })}
				/>
				<div class="autogen-text">
					<p>{`Stream Webhook: ${task.streamWebhook}`}</p>
					<p>{`Log URL: ${task.logUrl}`}</p>
				</div>
			</FormGroup>
			<FormGroup legendText="Task Name">
				<TextInput bind:value={task.name} placeholder="Please input task name" />
			</FormGroup>
			<FormGroup legendText="Task Type">
				<RadioButtonGroup
					disabled={!!task.id}
					bind:selected={task.type}
					on:change={(e) => handleTypeChange(e.detail)}
				>
					<RadioButton value="build" labelText="Build" />
					<RadioButton value="deploy" labelText="Deploy" />
				</RadioButtonGroup>
			</FormGroup>
			<FormGroup legendText="Auto Run">
				<Checkbox bind:checked={task.autoRun} />
			</FormGroup>
			<FormGroup legendText="Upstream Task Id">
				<TextInput bind:value={task.upstreamTaskId} placeholder="Please input upstream task id" />
			</FormGroup>
			{#if taskModalReq && buildConfig}
				<BuildConfigForm config={buildConfig} />
			{:else if taskModalReq && deployConfig}
				<DeployConfigForm
					config={deployConfig}
					availNetworkList={Array.from(selectedServer?.networks ?? [])}
				/>
			{/if}
		{/if}
	{/if}
</Modal>

<style>
	.autogen-text {
		margin: 5px 15px;
		color: #888;
	}

	.autogen-text p {
		font-size: 14px;
	}
</style>
