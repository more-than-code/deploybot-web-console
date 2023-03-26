<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline, DeployConfig, BuildConfig, Task } from 'models/pipeline';
	import {  invalidateAll } from '$app/navigation';

	export let data: PageData;

	let pipelines = data.pipelines ?? [];

	function runPipeline(pl: Pipeline) {
		if (pl.tasks.length === 0) {
			return;
		}

		const task = pl.tasks[0];
		runTask({ pipelineId: pl.id, taskId: task.id, streamWebhook: task.streamWebhook });
	}

	async function runTask({
		taskId,
		pipelineId,
		streamWebhook
	}: {
		taskId: string;
		pipelineId: string;
		streamWebhook: string;
	}) {
		await fetch(streamWebhook, {
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify({
				payload: {
					taskId: taskId,
					pipelineId: pipelineId
				}
			})
		});

		invalidateAll();
	}

	function logUri(t: Task): string {
		const name = (t.config as DeployConfig).ServiceName;
		if (name) {
			return `${t.streamWebhook}/serviceLogs?name=${name}`;
		}

		return '';
	}
</script>

<div>
	<h1>Pipelines</h1>
	{#each pipelines as pl}
		<div>
			Name: <b>{pl.name}</b> Status: <b>{pl.status}</b>
			<span style="margin-left: 20px">
				<button on:click={() => runPipeline(pl)} disabled={pl.status == 'Busy'}>RUN</button>
				<button>EDIT</button>
			</span>
		</div>
		<ul>
			<li>ID: {pl.id}</li>
			<li>Repo watched: {pl.repoWatched}</li>
			<li>Branch watched: {pl.branchWatched}</li>
			<li>Auto run: {pl.autoRun}</li>
			<li>Executed at: {pl.executedAt}</li>
			<li>Stopped at: {pl.stoppedAt}</li>
			<li>Arguments: {pl.arguments}</li>
		</ul>
		<details>
			<summary>Tasks</summary>
			<ol>
				{#each pl.tasks as t}
					<li style="margin-bottom:10px">
						Name: <b>{t.name}</b> Status: <b>{t.status}</b>
						<span style="margin-left: 20px">
							<button
								disabled={t.status == 'InProgress'}
								on:click={() =>
									runTask({ taskId: t.id, pipelineId: pl.id, streamWebhook: t.streamWebhook })}
								>RUN</button
							>
							<button>EDIT</button>
						</span>
					</li>
					<ul>
						<li>ID: {t.id}</li>
						<li>Upstream task ID: {t.upstreamTaskId}</li>
						<li>Stream webhook: {t.streamWebhook}</li>
						<li>Auto run: {t.autoRun}</li>
						<li>Executed at: {t.executedAt}</li>
						<li>Stopped at: {t.stoppedAt}</li>
						<li>Timeout: {t.timeout}</li>
						<li>
							Remarks:
							<p>{t.remarks}</p>
						</li>
						<li>Logs: <a href={logUri(t)}>View</a></li>
					</ul>
					<br />
				{/each}
			</ol>
		</details>
		<hr />
	{/each}
</div>
