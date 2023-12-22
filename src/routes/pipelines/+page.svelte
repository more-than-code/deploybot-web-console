<script lang="ts">
  import type { PageData } from './$types'
  import type { Pipeline } from 'models/pipeline'
  import type { TaskDeleteReq, TaskModalReq } from 'models/task'
  import { invalidateAll } from '$app/navigation'
  import { Button, DataTable, Grid, Modal, Tag } from 'carbon-components-svelte'
  import type { DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte'
  import TaskFormModal from '$lib/components/task-form/page.svelte'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'

  dayjs.extend(utc)

  export let data: PageData
  $: pipelines = data.pipelines ?? []

  let open = false
  let taskModalReq: TaskModalReq
  let openTaskDeleteModal = false
  let taskDeleteReq: TaskDeleteReq

  function runPipeline(pl: Pipeline | DataTableRow) {
    if (pl.tasks.length === 0) {
      return
    }

    let task = pl.tasks[0]
    if (task.name.indexOf('services') !== -1) {
      task = pl.tasks[1]
    }

    runTask({ pipelineId: pl.id, taskId: task.id, streamWebhook: task.streamWebhook })
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
    })

    await invalidateAll()
  }

  function showLog(pl: Pipeline | DataTableRow) {
    const tasks = pl.tasks
    if (tasks.length === 0) {
      return
    }

    const currentTask = tasks.find((task: any) => task.logUrl && task.logUrl.length > 0)
    if (!currentTask) {
      return
    }

    window.open(currentTask.logUrl, '_blank')
  }

  function localeDate(date: string) {
    return dayjs.utc(date).local().format('YYYY-MM-DD HH:mm:ss')
  }

  function showTaskFormModal({ id, pipelineId }: {
    id?: string,
    pipelineId: string
  }) {
    taskModalReq = {
      id,
      pipelineId,
      accessToken: data.accessToken || ''
    }

    open = true
  }

  function handleOpenDeleteTaskModal({ pipelineId, taskId }: { pipelineId: string, taskId: string }) {
    taskDeleteReq = {
      pipelineId,
      id: taskId
    }

    openTaskDeleteModal = true
  }

  async function handleDeleteTask() {
    const res: Response = await fetch('/api/task', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${data.accessToken}`
      },
      body: JSON.stringify(taskDeleteReq)
    })

    if (res.status !== 200) {
      return
    }

    window.location.reload()
  }
</script>

<div>
  <h1>Pipelines</h1>
  <Grid/>
  <DataTable
    batchExpansion
    headers={[
			{ key: 'name', value: 'Name' },
			{ key: 'id', value: 'Id' },
			{ key: 'status', value: 'Status' },
			{ key: 'labels', value: 'Labels' },
			{ key: 'executedAt', value: 'Executed at' },
			{ key: 'actions', value: 'Actions', width: '240px' }
		]}
    rows={pipelines}
  >
    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'actions'}
        <Button size="small" on:click={() => runPipeline(row)} disabled={row.status === 'Busy'}>RUN</Button>
        <Button size="small" kind="tertiary" on:click={() => showLog(row)}>LOG</Button>
      {:else if cell.key === 'labels'}
        {#if row.labels}
          {#each Object.keys(row.labels) as k}
            <Tag type="blue">{`${k}:${row.labels[k]}`}</Tag>
          {/each}
        {/if}
      {:else if cell.key === 'executedAt'}
        {localeDate(cell.value)}
      {:else}{cell.value}{/if}
    </svelte:fragment>
    <svelte:fragment slot="expanded-row" let:row>
      <ul>
        <li>ID: {row.id}</li>
        <li>Repo watched: {row.repoWatched}</li>
        <li>Branch watched: {row.branchWatched}</li>
        <li>Auto run: {row.autoRun}</li>
        <li>Executed at: {localeDate(row.executedAt)}</li>
        <li>Stopped at: {localeDate(row.stoppedAt)}</li>
        <li>Arguments: {row.arguments}</li>
      </ul>
      <Button size="small" style="margin: 10px 0;" on:click={() => showTaskFormModal({ pipelineId: row.id })}>Add Task</Button>
      {#if row.tasks?.length > 0}
        <details>
          <summary>Tasks</summary>
          <ol>
            {#each row.tasks as t}
              <hr/>
              <li style="margin-bottom: 10px; display: flex; align-items:center;">
                Name: <b>{t.name}</b> &nbsp;Status: <b>{t.status}</b>
                <span style="margin-left: 20px">
									<Button
                    size="small"
                    disabled={t.status === 'InProgress'}
                    on:click={() =>
											runTask({ taskId: t.id, pipelineId: row.id, streamWebhook: t.streamWebhook })}
                  >RUN</Button
                  >
									<Button size="small" kind="tertiary" on:click={() => showTaskFormModal({
									id: t.id,
									pipelineId: row.id
									})}>EDIT</Button>
                  <Button
                    size="small" kind="danger-tertiary"
                    on:click={() => handleOpenDeleteTaskModal({ pipelineId: row.id, taskId: t.id })}
                  >DELETE</Button>
								</span>
              </li>
              <ul>
                <li>ID: {t.id}</li>
                <li>Upstream task ID: {t.upstreamTaskId}</li>
                <li>Stream webhook: {t.streamWebhook}</li>
                <li>Auto run: {t.autoRun}</li>
                <li>Executed at: {localeDate(t.executedAt)}</li>
                <li>Stopped at: {localeDate(t.stoppedAt)}</li>
                <li>Timeout: {t.timeout}</li>
                <li>
                  Remarks:
                  <p>{t.remarks}</p>
                </li>
                <li>Logs: <a target="_blank" rel="noreferrer" href={t.logUrl}>View</a></li>
                <li>
                  Config:
                  <pre>{JSON.stringify(t.config, null, '\t')}</pre>
                </li>
              </ul>
              <br/>
            {/each}
          </ol>
        </details>
      {/if}
    </svelte:fragment>
  </DataTable>

  <Modal
    danger
    bind:open={openTaskDeleteModal}
    modalHeading="Delete Task"
    primaryButtonText="Delete"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (openTaskDeleteModal = false)}
    on:submit={handleDeleteTask}
  >
    <p>Confirm deletion of this task ?</p>
  </Modal>

  <TaskFormModal bind:open={open} taskModalReq={taskModalReq}/>
</div>

<style>
</style>
