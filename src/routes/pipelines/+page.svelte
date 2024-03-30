<script lang="ts">
  import type { PageData } from './$types'
  import type { DiskInfo, Network, Pipeline, Task } from 'models/pipeline'
  import type { TaskDeleteReq, TaskModalReq } from 'models/task'
  import { invalidateAll } from '$app/navigation'
  import { Button, DataTable, FormGroup, Grid, Modal, ProgressBar, Tag, TextInput } from 'carbon-components-svelte'
  import type { DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte'
  import TaskFormModal from '$lib/components/task-form/page.svelte'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import type { ItemResponse } from '../../models/response'
  import { onMount } from 'svelte'

  dayjs.extend(utc)

  export let data: PageData
  $: pipelines = data.pipelines ?? []

  let open = false
  let taskModalReq: TaskModalReq
  let openTaskDeleteModal = false
  let taskDeleteReq: TaskDeleteReq
  let openPipelineModal = false
  let openPipelineDeleteModal = false
  let pipelineId = ''
  let pipelineName = ''
  let pipelineEnv = 'dev'
  let openNetworkModal = false
  let openNetworkDeleteModal = false
  let networkName = ''
  let network: Network

  onMount(() => {
    getNetwork()
  })

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

  function showTaskFormModal({ id, pipelineId }: { id?: string; pipelineId: string }) {
    taskModalReq = {
      id,
      pipelineId,
      accessToken: data.accessToken || ''
    }

    open = true
  }

  function handleOpenDeleteTaskModal({
                                       pipelineId,
                                       taskId
                                     }: {
    pipelineId: string;
    taskId: string;
  }) {
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
        Authorization: `Bearer ${data.accessToken}`
      },
      body: JSON.stringify(taskDeleteReq)
    })

    if (res.status !== 200) return

    window.location.reload()
  }

  async function getDiskInfo(pl: Pipeline | DataTableRow) {
    if (!pl || !pl.tasks) return

    const task = pl.tasks.find(
      (task: Task) => task.name.indexOf('build') !== -1 || task.type === 'build'
    )
    if (!task || !task.streamWebhook || task.streamWebhook.length === 0) return

    const url = task.streamWebhook.replace('/streamWebhook', '')
    const res = await fetch(`${url}/diskInfo`, {
      method: 'GET'
    })

    if (res.status !== 200) return

    const diskInfoRes: ItemResponse<DiskInfo> = await res.json().catch((e) => console.error(e))
    if (!diskInfoRes || !diskInfoRes.payload) return

    task.diskInfo = diskInfoRes.payload
    const index = pl.tasks.findIndex((t: Task) => t.id === task.id)
    pl.tasks.splice(index, 1, task)

    pipelines = [...pipelines]
  }

  async function handleClearCache(streamWebhook: string) {
    if (!streamWebhook || streamWebhook.length === 0) return

    const url = streamWebhook.replace('/streamWebhook', '')
    const res = await fetch(`${url}/builderCache`, {
      method: 'DELETE',
      mode: 'cors'
    })

    if (res.status !== 200) {
      return
    }

    window.location.reload()
  }

  const handleOpenPipelineModal = (e: Event, pipeline: Pipeline | DataTableRow | undefined = undefined) => {
    e.stopPropagation()

    if (pipeline) {
      pipelineId = pipeline.id
      pipelineName = pipeline.name
      pipelineEnv = pipeline.labels['env'] || 'dev'
    } else {
      pipelineId = ''
      pipelineName = ''
      pipelineEnv = 'dev'
    }

    openPipelineModal = true
  }

  const handleSavePipeline = async (e: Event) => {
    e.preventDefault()

    if (!pipelineName) return

    let res: Response
    if (pipelineId) {
      res = await fetch('/api/pipeline', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${data.accessToken}`
        },
        body: JSON.stringify({
          id: pipelineId,
          pipeline: {
            name: pipelineName,
            labels: {
              env: pipelineEnv
            }
          }
        })
      })
    } else {
      res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.accessToken}`
        },
        body: JSON.stringify({
          name: pipelineName,
          projectId: data.pid,
          labels: {
            env: pipelineEnv
          }
        })
      })
    }

    if (res.status !== 200) return

    window.location.reload()
  }

  const handleOpenPipelineDeleteModal = (e: Event, id: string) => {
    e.stopPropagation()

    pipelineId = id
    openPipelineDeleteModal = true
  }

  const handleDeletePipeline = async () => {
    if (!pipelineId) return

    const res: Response = await fetch(`/api/pipeline/${pipelineId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${data.accessToken}`
      }
    })

    if (res.status !== 200) return

    window.location.reload()
  }

  const getNetwork = async () => {
    const url = getBaseUrl()
    if (!url) return

    const res: Response = await fetch(`${url}/networks`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${data.accessToken}`
      }
    })

    if (res.status !== 200) return

    console.log(res)
  }

  const getBaseUrl = () => {
    if (!pipelines || pipelines.length === 0) return undefined

    let task: Task | undefined
    pipelines.forEach(pl => {
      if (!pl.tasks || pl.tasks.length === 0) return undefined

      task = pl.tasks.find(t => t.type === 'deploy')
    })

    if (!task) return undefined

    const url = task.streamWebhook.replace('/streamWebhook', '')
    if (!url) return undefined

    return url
  }

  const handleSaveNetwork = async () => {
    if (!networkName || networkName.trim().length === 0) return

    const url = getBaseUrl()
    const res = await fetch(`${url}/network`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.accessToken}`
      },
      body: JSON.stringify({
        name: networkName
      })
    })

    if (res.status !== 200) return

    window.location.reload()
  }

  const handleDeleteNetwork = async () => {
    const url = getBaseUrl()
    if (!url) return

    if (!network) return

    const res = await fetch(`/${url}/network/${network.name}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${data.accessToken}`
      }
    })

    if (res.status !== 200) return

    window.location.reload()

  }
</script>

<div class="pipeline-wrapper">
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
        <Button size="small" on:click={() => runPipeline(row)} disabled={row.status === 'Busy'}>
          RUN
        </Button>
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
      <Button
        size="small"
        style="margin: 10px 0;"
        on:click={() => showTaskFormModal({ pipelineId: row.id })}>
        Add Task
      </Button>
      <Button size="small" kind="tertiary" style="margin: 10px 0;"
              on:click={(e) => handleOpenPipelineModal(e, row)}>
        EDIT PIPELINE
      </Button>
      <Button size="small" kind="danger-tertiary" style="margin: 10px 0;"
              on:click={(e) => handleOpenPipelineDeleteModal(e, row.id)}>
        REMOVE PIPELINE
      </Button>
      {#if row.tasks?.length > 0}
        <details>
          <summary on:click={() => getDiskInfo(row)}>Tasks</summary>
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
									<Button
                    size="small"
                    kind="tertiary"
                    on:click={() =>
											showTaskFormModal({
												id: t.id,
												pipelineId: row.id
											})}>EDIT</Button
                  >
									<Button
                    size="small"
                    kind="danger-tertiary"
                    on:click={() => handleOpenDeleteTaskModal({ pipelineId: row.id, taskId: t.id })}
                  >DELETE</Button
                  >
								</span>
              </li>
              {#if t.diskInfo}
                <li style="display: flex; align-items:center;">
                  Disk info:
                  <div
                    style="background-color:#fff; border: 1px solid #0F62FE; margin-left: 10px; width: 180px; margin-right: 10px;"
                  >
                    <ProgressBar
                      hideLabel
                      value={t.diskInfo.availSize}
                      max={t.diskInfo.totalSize}
                    />
                  </div>
                  <Button
                    size="small"
                    kind="danger-tertiary"
                    on:click={() => handleClearCache(t.streamWebhook)}
                  >CLEAR CACHE
                  </Button>
                </li>
              {/if}
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
  <div class="btn-group">
    <Button style="margin-top: 20px;" on:click={(e) => handleOpenPipelineModal(e)}>Add Pipeline</Button>
    <div class="network-group">
      {#if !network}
        <Button kind="tertiary" on:click={() => openNetworkModal = true}>Add Network</Button>
      {:else}
        <Button kind="danger-tertiary" on:click={() => openNetworkDeleteModal = true}>Delete Network</Button>
        <div class="network-item">
          <p>Id: {network.id}</p>
          <p>Name: {network.name}</p>
        </div>
      {/if}
    </div>
  </div>

  <Modal
    preventCloseOnClickOutside
    shouldSubmitOnEnter={false}
    bind:open={openPipelineModal}
    modalHeading="Edit Pipeline"
    primaryButtonText="Save"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (openPipelineModal = false)}
    on:submit={handleSavePipeline}
  >
    <FormGroup legendText="Name">
      <TextInput bind:value={pipelineName} placeholder="Please input pipeline name"/>
    </FormGroup>
    <FormGroup legendText="Env">
      <TextInput bind:value={pipelineEnv} placeholder="Please input pipeline env"/>
    </FormGroup>
  </Modal>

  <Modal
    preventCloseOnClickOutside
    shouldSubmitOnEnter={false}
    bind:open={openNetworkModal}
    modalHeading="Edit Network"
    primaryButtonText="Save"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (openNetworkModal = false)}
    on:submit={handleSaveNetwork}
  >
    <FormGroup legendText="Name">
      <TextInput bind:value={networkName} placeholder="Please input network name"/>
    </FormGroup>
  </Modal>

  <Modal
    danger
    shouldSubmitOnEnter={false}
    bind:open={openPipelineDeleteModal}
    modalHeading="Delete Pipeline"
    primaryButtonText="Delete"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (openPipelineDeleteModal = false)}
    on:submit={handleDeletePipeline}
  >
    <p>Confirm deletion of this pipeline ?</p>
  </Modal>

  <Modal
    danger
    shouldSubmitOnEnter={false}
    bind:open={openTaskDeleteModal}
    modalHeading="Delete Task"
    primaryButtonText="Delete"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (openTaskDeleteModal = false)}
    on:submit={handleDeleteTask}
  >
    <p>Confirm deletion of this task ?</p>
  </Modal>

  <Modal
    danger
    shouldSubmitOnEnter={false}
    bind:open={openNetworkDeleteModal}
    modalHeading="Delete Network"
    primaryButtonText="Delete"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (openNetworkDeleteModal = false)}
    on:submit={handleDeleteNetwork}
  >
    <p>Confirm deletion of this network ?</p>
  </Modal>

  <TaskFormModal bind:open {taskModalReq}/>
</div>

<style>
  .pipeline-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  h1 {
    font-weight: 700;
    margin-bottom: 20px;
    padding-left: 10px;
    margin-top: 10px;
  }

  .btn-group {
    margin-left: 10px;
    display: flex;
    flex-direction: column;
  }

  .network-group {
    margin-top: 20px;
    display: flex;
    align-items: center;
  }

  .network-item {
    margin-left: 10px;
  }
</style>
