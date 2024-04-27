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
	import type { Task } from 'models/pipeline';
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
	let configRawJson: string;
	let isLoading = false;
	let isRawJsonEditingMode = false;

	$: selectedDeployServer = deployServers?.find((e) => task?.webhookHost === e.host);

	$: {
		taskModalReq && getTask();
	}

	$: {
		if (task) {
			if (task.webhookHost && task.config?.serviceName) {
				task.logUrl = `https://${task.webhookHost}/serviceLogs?name=${task.config.serviceName}`;
			}
		}
	}

	async function getTask() {
		if (!taskModalReq || isLoading) return;

		if (!taskModalReq.id) {
			task = {
				type: TaskType.BUILD
			};

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

		task = taskRes.payload.task;

		if (!task) {
			isLoading = false;
			return;
		}

		if (task.type === '') {
			task.type = task.name?.includes(TaskType.BUILD) ? TaskType.BUILD : TaskType.DEPLOY;
		}

		if (task.type.toLowerCase() === TaskType.BUILD) {
			task.type = TaskType.BUILD;
		} else {
			task.type = TaskType.DEPLOY;
		}

		task.config = transformCamelCase(task.config);

		isLoading = false;
	}

	function handleCancel() {
		open = false;
		taskModalReq = undefined;
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
				task
			})
		});

		if (res.status !== 200) {
			isLoading = false;
			return;
		}

		window.location.reload();
	}

	function handleJsonEditingModeChange(e: Event) {
		if ((e.target as HTMLInputElement)?.checked) {
			const { createdAt, updatedAt, stoppedAt, executedAt, ...rest } = { ...task };
			configRawJson = JSON.stringify(rest, null, '\t');
		} else {
			task = JSON.parse(configRawJson, (key, value) => {
				if (
					typeof value === 'object' &&
					value !== null &&
					['args', 'volumeMounts', 'files', 'ports', 'networks'].includes(key)
				) {
					return CustomMap.fromJSON(value);
				}
				return value;
			});
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
			<TextArea bind:value={configRawJson} rows={50} />
		{:else}
			<FormGroup legendText="Webhook Host">
				{#if task.type === TaskType.BUILD}
					<Dropdown
						bind:selectedId={task.webhookHost}
						label="Select"
						items={buildServers?.map((e, i) => {
							return {
								id: e.host,
								text: `Name: ${e.name}; Host:${e.host}`
							};
						})}
					/>
				{:else}
					<Dropdown
						bind:selectedId={task.webhookHost}
						label="Select"
						items={deployServers?.map((e, i) => {
							return {
								id: e.host,
								text: `Name: ${e.name}; Host:${e.host}`
							};
						})}
					/>
				{/if}
			</FormGroup>
			<FormGroup legendText="Task Name">
				<TextInput bind:value={task.name} placeholder="Please input task name" />
			</FormGroup>
			<FormGroup legendText="Task Type">
				<RadioButtonGroup
					disabled={!!task.id}
					bind:selected={task.type}
					on:change={() => {
						if (task) task.config = {};
					}}
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
			{#if task.type === TaskType.BUILD}
				<BuildConfigForm config={task.config ?? {}} />
			{:else}
				<DeployConfigForm
					config={task.config ?? {}}
					availNetworkList={Array.from(selectedDeployServer?.networks ?? [])}
				/>
			{/if}
		{/if}
	{/if}
</Modal>
