<script lang="ts">
  import { Button, FormGroup, Loading, Modal, RadioButton, RadioButtonGroup, TextInput, Toggle } from 'carbon-components-svelte'
  import type { BuildConfig, DeployConfig, Task } from 'models/pipeline'
  import type { TaskModalReq, TaskPayload } from 'models/task'
  import type { ItemResponse } from 'models/response'
  import { arr2Obj, obj2Arr, transformCamelCase } from '$lib/shared/utils/utils'

  enum TaskType {
    BUILD = 'build',
    DEPLOY = 'deploy'
  }

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

    if (!taskModalReq.id) {
      task = {
        id: '',
        name: '',
        type: TaskType.BUILD,
        autoRun: false,
        logUrl: '',
        streamWebhook: '',
        upstreamTaskId: '',
        config: {
          imageName: '',
          imageTag: '',
          args: {},
          dockerfile: '',
          repoUrl: '',
          repoName: '',
          repoBranch: ''
        }
      }

      handleTypeChange(task.type)
      return
    }

    isLoading = true
    const res: Response = await fetch(`/api/task?pid=${taskModalReq.pipelineId}&id=${taskModalReq.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${taskModalReq.accessToken}`
      }
    })

    if (res.status !== 200) {
      isLoading = false
      return
    }

    const taskRes: ItemResponse<TaskPayload> = await res.json()
    task = taskRes.payload.Task

    if (task.type === '') {
      task.type = task.name.includes(TaskType.BUILD) ? TaskType.BUILD : TaskType.DEPLOY
    }

    if (task.type.toLowerCase() === TaskType.BUILD) {
      task.type = TaskType.BUILD
      buildConfig = transformCamelCase(task.config as BuildConfig)
      buildConfigArgs = obj2Arr(buildConfig.args)
    } else {
      task.type = TaskType.DEPLOY
      deployConfig = transformCamelCase(task.config as DeployConfig)
      deployConfig.env = deployConfig.env ? deployConfig.env : []
    }

    isLoading = false
  }

  function filterEmptyEnv() {
    if (!taskModalReq || task?.type === TaskType.BUILD || !deployConfig) return

    deployConfig.env = deployConfig.env.filter(env => env !== '')
  }

  function transformArgs() {
    if (!taskModalReq || task?.type === TaskType.DEPLOY || !buildConfig) return

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

    isLoading = true
    const res: Response = await fetch(`/api/task`, {
      method: task.id ? 'PATCH' : 'POST',
      headers: {
        'Authorization': `Bearer ${taskModalReq.accessToken}`
      },
      body: JSON.stringify({
        id: task.id,
        pipelineId: taskModalReq.pipelineId,
        task: {
          ...task,
          config: task.type === TaskType.BUILD ? buildConfig : deployConfig
        }
      })
    })

    if (res.status !== 200) {
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

  function handleTypeChange(type: string) {
    if (!task) return

    if (type === TaskType.BUILD) {
      deployConfig = undefined
      buildConfig = {
        imageName: '',
        imageTag: '',
        args: {},
        dockerfile: '',
        repoUrl: '',
        repoName: '',
        repoBranch: ''
      }
    } else {
      buildConfig = undefined
      deployConfig = {
        env: [],
        imageName: '',
        imageTag: '',
        serviceName: '',
        mountSource: '',
        mountTarget: '',
        hostPort: '',
        exposedPort: '',
        networkId: '',
        networkName: '',
        autoRemove: false
      }
    }
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
  {#if task}
    <FormGroup legendText="Task Name">
      <TextInput bind:value={task.name} placeholder="Please input task name"/>
    </FormGroup>
    <FormGroup legendText="Task Type">
      <RadioButtonGroup disabled={!!task.id} bind:selected={task.type} on:change={(e) => handleTypeChange(e.detail)}>
        <RadioButton value="build" labelText="Build"/>
        <RadioButton value="deploy" labelText="Deploy"/>
      </RadioButtonGroup>
    </FormGroup>
    <FormGroup legendText="Auto Run">
      <Toggle hideLabel bind:toggled={task.autoRun}/>
    </FormGroup>
    <FormGroup legendText="Log Url">
      <TextInput bind:value={task.logUrl} placeholder="Please input log url"/>
    </FormGroup>
    <FormGroup legendText="Stream Web Hook">
      <TextInput bind:value={task.streamWebhook} placeholder="Please input stream web hook"/>
    </FormGroup>
    <FormGroup legendText="Upstream Task Id">
      <TextInput bind:value={task.upstreamTaskId} placeholder="Please input upstream task id"/>
    </FormGroup>
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
  {/if}
</Modal>

<style>
  .env-item {
    display: flex;
    margin-bottom: 10px;
  }
</style>