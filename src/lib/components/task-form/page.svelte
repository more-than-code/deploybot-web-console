<script lang="ts">
	import {
		FormGroup,
		Loading,
		Modal,
		RadioButton,
		RadioButtonGroup,
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

	enum TaskType {
		BUILD = 'build',
		DEPLOY = 'deploy'
	}

	export let open = false;
	export let taskModalReq: TaskModalReq | undefined;

	let task: Task | undefined;
	let buildConfig: BuildConfig | undefined;
	let deployConfig: DeployConfig | undefined;

	let isLoading = false;

	$: taskModalReq && getTask();

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
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!taskModalReq || !task || isLoading) return;

		isLoading = true;

		const res: Response = await fetch(`/api/task`, {
			method: task.id ? 'PATCH' : 'POST',
			headers: {
				Authorization: `Bearer ${taskModalReq.accessToken}`
			},
			body: JSON.stringify({
				id: task.id,
				pipelineId: taskModalReq.pipelineId,
				task: {
					...task,
					config: task.type === TaskType.BUILD ? buildConfig : deployConfig
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
	{#if task}
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
			<Toggle hideLabel bind:toggled={task.autoRun} />
		</FormGroup>
		<FormGroup legendText="Log Url">
			<TextInput bind:value={task.logUrl} placeholder="Please input log url" />
		</FormGroup>
		<FormGroup legendText="Stream Web Hook">
			<TextInput bind:value={task.streamWebhook} placeholder="Please input stream web hook" />
		</FormGroup>
		<FormGroup legendText="Upstream Task Id">
			<TextInput bind:value={task.upstreamTaskId} placeholder="Please input upstream task id" />
		</FormGroup>
		{#if taskModalReq && buildConfig}
			<BuildConfigForm config={buildConfig} />
		{:else if taskModalReq && deployConfig}
			<DeployConfigForm config={deployConfig} />
		{/if}
	{/if}
</Modal>
