<script lang="ts">
  import { Button, FormGroup, Loading, Modal, TextArea, TextInput } from 'carbon-components-svelte'
  import type { BuildConfig, DeployConfig, Task } from 'models/pipeline'
  import type { TaskModalReq, TaskPayload, TaskUpdateInput } from 'models/task'
  import type { ItemResponse } from 'models/response'
  import { arr2Obj, obj2Arr, transformCameCase } from '$lib/shared/utils/utils'

  export let open = false
  export let taskModalReq: TaskModalReq | undefined

  let task: Task | undefined
  let buildConfig: BuildConfig | undefined
  let deployConfig: DeployConfig | undefined
  let buildConfigArgs: string[] = []
  let isLoading = false

  $: taskModalReq && getTask()

  async function getTask() {
    if (!taskModalReq || isLoading) return

    isLoading = true
    const res: Response = await fetch(`/api/task?pid=${taskModalReq.pipelineId}&id=${taskModalReq.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${taskModalReq.accessToken}`
      }
    })

    if (res.status !== 200) {
      console.info(res.status, res.statusText)
      isLoading = false
      return
    }

    const taskRes: ItemResponse<TaskPayload> = await res.json()
    task = taskRes.payload.Task

    if (taskModalReq.isBuild) {
      buildConfig = transformCameCase(task.config as BuildConfig)
      buildConfigArgs = obj2Arr(buildConfig.args)
    } else {
      deployConfig = task.config as DeployConfig
    }

    isLoading = false
  }

  function filterEmptyEnv() {
    if (!taskModalReq || taskModalReq.isBuild || !deployConfig) return

    deployConfig.env = deployConfig.env.filter(env => env !== '')
  }

  function transformArgs() {
    if (!taskModalReq || !taskModalReq.isBuild || !buildConfig) return

    buildConfig.args = arr2Obj(buildConfigArgs)
  }

  function handleCancel() {
    open = false
    taskModalReq = undefined
    buildConfig = undefined
    deployConfig = undefined
    task = undefined
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()

    if (!taskModalReq || !task || isLoading) return

    filterEmptyEnv()
    transformArgs()

    const taskUpdateInput: TaskUpdateInput = {
      id: task.id,
      pipelineId: taskModalReq.pipelineId,
      task: {
        config: taskModalReq.isBuild ? buildConfig : deployConfig
      }
    }

    isLoading = true
    const res: Response = await fetch(`/api/task`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${taskModalReq.accessToken}`
      },
      body: JSON.stringify(taskUpdateInput)
    })

    if (res.status !== 200) {
      console.info(res.status, res.statusText)
      isLoading = false
      return
    }

    window.location.reload()
  }

  function handleAddEnv() {
    if (!deployConfig) return

    deployConfig.env = [...deployConfig.env, '']
  }

  function handleRemoveEnv(i: number) {
    if (!deployConfig) return

    deployConfig.env.splice(i, 1)
    deployConfig.env = deployConfig.env
  }

  function handleAddArg() {
    buildConfigArgs = [...buildConfigArgs, '']
  }

  function handleRemoveArg(i: number) {
    buildConfigArgs.splice(i, 1)
    buildConfigArgs = buildConfigArgs
  }
</script>

<Modal
  bind:open
  modalHeading="Modify Task"
  primaryButtonText="Confirm"
  secondaryButtonText="Cancel"
  on:click:button--secondary={handleCancel}
  on:submit={handleSubmit}
  on:close={handleCancel}
>
  <Loading active={isLoading}/>
  {#if taskModalReq && buildConfig}
    <FormGroup legendText="Image Name">
      <TextInput bind:value={buildConfig.imageName} placeholder="Please input image name"/>
    </FormGroup>
    <FormGroup legendText="Image Tag">
      <TextInput bind:value={buildConfig.imageTag} placeholder="Please input image tag"/>
    </FormGroup>
    <FormGroup legendText="Args">
      {#each buildConfigArgs as arg, i}
        <div class="env-item">
          <TextInput bind:value={arg} placeholder="Please input arg,ex: key=value" style="margin-right: 10px;"/>
          <Button kind="danger-tertiary" size="small" on:click={() => handleRemoveArg(i)}>Remove</Button>
        </div>
      {/each}
      <Button kind="tertiary" on:click={handleAddArg}>Add</Button>
    </FormGroup>
    <FormGroup legendText="Dockerfile">
      <TextInput bind:value={buildConfig.dockerfile} placeholder="Please input dockerfile"/>
    </FormGroup>
    <FormGroup legendText="Repo Url">
      <TextInput bind:value={buildConfig.repoUrl} placeholder="Please input repo url"/>
    </FormGroup>
    <FormGroup legendText="Repo Name">
      <TextInput bind:value={buildConfig.repoName} placeholder="Please input repo name"/>
    </FormGroup>
    <FormGroup legendText="Repo Branch">
      <TextInput bind:value={buildConfig.repoBranch} placeholder="Please input repo branch"/>
    </FormGroup>
  {:else if taskModalReq && deployConfig}
    <FormGroup legendText="Env">
      {#each deployConfig.env as env, i}
        <div class="env-item">
          <TextInput bind:value={env} placeholder="Please input env,ex: key=value" style="margin-right: 10px;"/>
          <Button kind="danger-tertiary" size="small" on:click={() => handleRemoveEnv(i)}>Remove</Button>
        </div>
      {/each}
      <Button kind="tertiary" on:click={handleAddEnv}>Add</Button>
    </FormGroup>
    <FormGroup legendText="Image Name">
      <TextInput bind:value={deployConfig.imageName} placeholder="Please input image name"/>
    </FormGroup>
    <FormGroup legendText="Image Tag">
      <TextInput bind:value={deployConfig.imageTag} placeholder="Please input image tag"/>
    </FormGroup>
    <FormGroup legendText="Service Name">
      <TextInput bind:value={deployConfig.serviceName} placeholder="Please input service name"/>
    </FormGroup>
    <FormGroup legendText="Mount Source">
      <TextInput bind:value={deployConfig.mountSource} placeholder="Please input mount source"/>
    </FormGroup>
    <FormGroup legendText="Mount Target">
      <TextInput bind:value={deployConfig.mountTarget} placeholder="Please input mount target"/>
    </FormGroup>
    <FormGroup legendText="Host Port">
      <TextInput bind:value={deployConfig.hostPort} placeholder="Please input host port"/>
    </FormGroup>
    <FormGroup legendText="Expose Port">
      <TextInput bind:value={deployConfig.exposedPort} placeholder="Please input expose port"/>
    </FormGroup>
    <FormGroup legendText="Network Id">
      <TextInput bind:value={deployConfig.networkId} placeholder="Please input network id"/>
    </FormGroup>
    <FormGroup legendText="Network Name">
      <TextInput bind:value={deployConfig.networkName} placeholder="Please input network name"/>
    </FormGroup>
  {/if}
</Modal>

<style>
  .env-item {
    display: flex;
    margin-bottom: 10px;
  }
</style>