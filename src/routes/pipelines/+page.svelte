<script lang="ts">
	import type { PageData } from './$types';
	import type { Pipeline } from 'models/pipeline';
	import { invalidateAll } from '$app/navigation';
	import { Grid, Tag } from 'carbon-components-svelte';
	import { DataTable } from 'carbon-components-svelte';
	import type { DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';

	export let data: PageData;

	$: pipelines = data.pipelines ?? [];

	function runPipeline(pl: Pipeline | DataTableRow) {
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

		await invalidateAll();
	}
</script>

<div>
	<h1>Pipelines</h1>
	<Grid></Grid>
	<DataTable
		expandable
		headers={[
			{ key: 'name', value: 'Name' },
			{ key: 'id', value: 'Id' },
			{ key: 'status', value: 'Status' },
			{ key: 'labels', value: 'Labels' },
			{ key: 'executedAt', value: 'Executed at' },
			{ key: 'actions', empty: true }
		]}
		rows={pipelines}
	>
		<svelte:fragment slot="cell" let:cell let:row>
			{#if cell.key === 'actions'}
				<span style="margin-left: 20px">
					<button on:click={() => runPipeline(row)} disabled={row.status == 'Busy'}>RUN</button>
					<button>EDIT</button>
				</span>
			{:else if cell.key === 'labels'}
				{#if row.labels}
					{#each Object.keys(row.labels) as k}
						<Tag type="blue">{`${k}:${row.labels[k]}`}</Tag>
					{/each}
				{/if}
			{:else}{cell.value}{/if}
		</svelte:fragment>
		<svelte:fragment slot="expanded-row" let:row>
			<ul>
				<li>ID: {row.id}</li>
				<li>Repo watched: {row.repoWatched}</li>
				<li>Branch watched: {row.branchWatched}</li>
				<li>Auto run: {row.autoRun}</li>
				<li>Executed at: {row.executedAt}</li>
				<li>Stopped at: {row.stoppedAt}</li>
				<li>Arguments: {row.arguments}</li>
			</ul>
			{#if row.tasks?.length > 0}
				<details>
					<summary>Tasks</summary>
					<ol>
						{#each row.tasks as t}
							<hr />
							<li style="margin-bottom:10px">
								Name: <b>{t.name}</b> Status: <b>{t.status}</b>
								<span style="margin-left: 20px">
									<button
										disabled={t.status === 'InProgress'}
										on:click={() =>
											runTask({ taskId: t.id, pipelineId: row.id, streamWebhook: t.streamWebhook })}
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
								<li>Logs: <a target="_blank" rel="noreferrer" href={t.logUrl}>View</a></li>
								<li>
									Config: <pre>{JSON.stringify(t.config, null, '\t')}</pre>
								</li>
							</ul>
							<br />
						{/each}
					</ol>
				</details>
			{/if}
		</svelte:fragment>
	</DataTable>
</div>

<style>
</style>
