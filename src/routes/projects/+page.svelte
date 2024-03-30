<script lang="ts">
  import type { PageData } from './$types'
  import { Button, Modal, TextInput } from 'carbon-components-svelte'
  import type { Project } from '../../models/projects'

  export let data: PageData

  const projects = data.projects ?? []
  let openEditModal = false
  let openDeleteModal = false
  let projectName = ''
  let projectId = ''

  const handleGoPipeline = (id: string) => {
    window.location.href = `/pipelines?pid=${id}`
  }

  const handleOpenEditModal = (e: Event, project: Project | undefined = undefined) => {
    e.stopPropagation()

    if (project) {
      projectName = project.name
      projectId = project.id
    } else {
      projectName = ''
      projectId = ''
    }

    openEditModal = true
  }

  const handleOpenDeleteModal = (e: Event, id: string) => {
    e.stopPropagation()

    projectId = id
    openDeleteModal = true
  }

  const handleSave = async () => {
    if (projectName.trim().length === 0) return

    let res: Response
    if (projectId) {
      res = await fetch(`/api/project/${projectId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${data.accessToken}`
        },
        body: JSON.stringify({
          name: projectName
        })
      })
    } else {
      res = await fetch('/api/project', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.accessToken}`
        },
        body: JSON.stringify({
          name: projectName,
          id: projectId
        })
      })
    }

    if (res.status !== 200) return

    window.location.reload()
  }

  const handleDelete = async () => {
    if (!projectId) return

    const res: Response = await fetch(`/api/project/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${data.accessToken}`
      }
    })

    if (res.status !== 200) return

    window.location.reload()
  }
</script>

<div class="project-wrapper">
  <h1>Projects</h1>
  {#each projects as proj}
    <div class="project-item"
         on:click={() => handleGoPipeline(proj.id)}
         on:keydown={(e) => e.key === 'Enter' && handleGoPipeline(proj.id)}
    >
      <p class="project-title">{proj.name}</p>
      <div class="btn-group">
        <Button size="small" kind="tertiary" on:click={(e) => handleOpenEditModal(e, proj)}>EDIT</Button>
        <Button size="small" kind="danger-tertiary" on:click={(e) => handleOpenDeleteModal(e, proj.id)}>REMOVE</Button>
      </div>
    </div>
  {/each}
  <Button style="width: 300px; margin-top: 20px;" on:click={(e) => handleOpenEditModal(e)}>Add Project</Button>

  <Modal
    preventCloseOnClickOutside
    shouldSubmitOnEnter={false}
    bind:open={openEditModal}
    modalHeading="Edit Project"
    primaryButtonText="Save"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (openEditModal = false)}
    on:submit={handleSave}
  >
    <TextInput bind:value={projectName} placeholder="Please input project name"/>
  </Modal>

  <Modal
    danger
    shouldSubmitOnEnter={false}
    bind:open={openDeleteModal}
    modalHeading="Delete Project"
    primaryButtonText="Delete"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (openDeleteModal = false)}
    on:submit={handleDelete}
  >
    <p>Confirm deletion of this project ?</p>
  </Modal>
</div>

<style>
  .project-wrapper {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  h1 {
    font-weight: 700;
    margin-bottom: 20px;
  }

  .project-item {
    margin: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    width: 300px;
    cursor: pointer;
    transition: all .2s;
  }

  .project-item:hover {
    background-color: #ccc;
  }

  .project-item:hover .project-title {
    color: #fff;
  }

  .project-title {
    font-weight: 700;
    margin-bottom: 20px;
  }
</style>
