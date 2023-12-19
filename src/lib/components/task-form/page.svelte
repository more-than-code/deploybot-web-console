<script lang="ts">
  import { Form, FormGroup, Modal, TextArea, TextInput } from 'carbon-components-svelte'

  export let open = false
  export let pipelineId = ''
  export let taskId = ''

  $: taskId !== '' && getTask()

  async function getTask() {
    const res = await fetch(`/api/task?pid=${pipelineId}&id=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer `
      }
    })

    console.log(res)
  }
</script>

<Modal
  bind:open
  modalHeading="Modify Task"
  primaryButtonText="Confirm"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (open = false)}
>
  <Form>
    <FormGroup legendText="Env Config">
      <TextArea placeholder="Please input env config"/>
    </FormGroup>
    <FormGroup legendText="Image Name">
      <TextInput placeholder="Please input image name"/>
    </FormGroup>
    <FormGroup legendText="Image Tag">
      <TextInput placeholder="Please input image tag"/>
    </FormGroup>
    <FormGroup legendText="Mount Source">
      <TextInput placeholder="Please input image tag"/>
    </FormGroup>
    <FormGroup legendText="Mount Target">
      <TextInput placeholder="Please input mount target"/>
    </FormGroup>
    <FormGroup legendText="Network Id">
      <TextInput placeholder="Please input network id"/>
    </FormGroup>
    <FormGroup legendText="Network Name">
      <TextInput placeholder="Please input network name"/>
    </FormGroup>
    <FormGroup legendText="Restart Policy">
      <TextInput placeholder="Please input restart policy"/>
    </FormGroup>
    <FormGroup legendText="Service Name">
      <TextInput placeholder="Please input service name"/>
    </FormGroup>
  </Form>
</Modal>