<script lang="ts">
	import { CustomMap } from '$lib/types/customMap';
	import {
		Button,
		FormGroup,
		Modal,
		Select,
		SelectItem,
		TextInput
	} from 'carbon-components-svelte';
	import type { Network, Project, Server } from '../../models/projects';
	import type { ItemResponse } from '../../models/response';
	import type { PageData } from './$types';

	export let data: PageData;

	const DEFAULT_SERVER: Server = {
		name: '',
		host: '',
		allNetworks: []
	};

	const DEFAULT_DEPLOY_SERVER: Server = {
		...DEFAULT_SERVER,
		networks: new CustomMap<string, string>()
	};

	const DEFAULT_PROJECT: Project = {
		name: '',
		deployServers: [{ ...DEFAULT_DEPLOY_SERVER }],
		buildServers: [{ ...DEFAULT_SERVER }]
	};

	const projects = data.projects ?? [];
	let openEditModal = false;
	let openDeleteModal = false;
	let project: Project = { ...DEFAULT_PROJECT };

	const handleGoPipeline = (id: string | undefined) => {
		if (!id) return;

		window.location.href = `/pipelines?pid=${id}`;
	};

	const handleOpenEditModal = (e: Event, proj: Project | undefined = undefined) => {
		e.stopPropagation();

		if (proj) {
			project = { ...proj };

			if (!proj.buildServers || proj.buildServers.length === 0) {
				project.buildServers = [{ ...DEFAULT_SERVER }];
			}

			if (!proj.deployServers || proj.deployServers.length === 0) {
				project.deployServers = [{ ...DEFAULT_SERVER }];
			} else {
				project.deployServers.forEach((server, i) => {
					loadNetworks(server, i);
				});
			}
		} else {
			project = { ...DEFAULT_PROJECT };
		}

		openEditModal = true;
	};

	const loadNetworks = async (server: Server, index: number) => {
		if (!server || !server.host || server.host.length === 0) return;

		const host = server.host;
		const res = await fetch(`https://${host}/networks`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${data.accessToken}`
			}
		});

		const networkRes: ItemResponse<Network[]> = await res.json().catch((e) => console.error(e));
		const networks = networkRes.payload;

		if (!networks || networks.length === 0) return;

		const entries = server.networks ? Object.entries(server.networks) : [];

		project.deployServers[index] = {
			...server,
			currentNetwork: entries && entries.length > 0 ? `${entries[0][0]}:${entries[0][1]}` : '',
			allNetworks: networks
		};
	};

	const handleAddBuildServer = () => {
		project.buildServers = [...project.buildServers, { ...DEFAULT_SERVER }];
	};

	const handleAddDeployServer = () => {
		project.deployServers = [...project.deployServers, { ...DEFAULT_DEPLOY_SERVER }];
	};

	const handleRemoveBuildServer = (index: number) => {
		if (project.buildServers.length <= 1) return;

		project.buildServers = project.buildServers.filter((_, i) => i !== index);
	};

	const handleRemoveDeployServer = (index: number) => {
		if (project.deployServers.length <= 1) return;

		project.deployServers = project.deployServers.filter((_, i) => i !== index);
	};

	const handleSelectNetwork = (e: Event, index: number) => {
		const target = e.target as HTMLSelectElement;
		const selectedNetwork = target.value;

		const [name, id] = selectedNetwork.split(':');
		project.deployServers[index].networks = new CustomMap([[name, id]]);
	};

	const handleRemoveNetwork = (index: number) => {
		project.deployServers[index].currentNetwork = '';
		project.deployServers[index].networks = new CustomMap<string, string>();
	};

	const handleAddNetwork = async (server: Server, index: number) => {
		if (!server || !server.name || !server.host || server.host.length === 0) return;

		const host = server.host;
		const res = await fetch(`https://${host}/network`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${data.accessToken}`
			},
			body: JSON.stringify({ name: `${server.name.toLowerCase()}-network` })
		});

		const networkRes: ItemResponse<Network> = await res.json().catch((e) => console.error(e));
		const network = networkRes.payload;

		const networks = project.deployServers[index].allNetworks ?? [];
		project.deployServers[index].allNetworks = [...networks, network];

		alert('Network created successfully');
	};

	const handleOpenDeleteModal = (e: Event, proj: Project | undefined) => {
		if (!proj) return;

		e.stopPropagation();

		project = proj;
		openDeleteModal = true;
	};

	const handleSave = async () => {
		if (project.name.trim().length === 0) return;

		let projectId = project.id;
		let res: Response;
		if (projectId) {
			res = await fetch(`/api/project/${projectId}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${data.accessToken}`
				},
				body: JSON.stringify(project)
			});
		} else {
			res = await fetch('/api/project', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${data.accessToken}`
				},
				body: JSON.stringify(project)
			});
		}

		if (res.status !== 200) return;

		window.location.reload();
	};

	const handleDelete = async () => {
		if (!project) return;

		const res: Response = await fetch(`/api/project/${project.id}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${data.accessToken}`
			}
		});

		if (res.status !== 200) return;

		window.location.reload();
	};
</script>

<div class="project-wrapper">
	<h1>Projects</h1>
	{#each projects as proj}
		<div
			class="project-item"
			on:click={() => handleGoPipeline(proj.id)}
			on:keydown={(e) => e.key === 'Enter' && handleGoPipeline(proj.id)}
		>
			<p class="project-title">{proj.name}</p>
			<div class="btn-group">
				<Button size="small" kind="tertiary" on:click={(e) => handleOpenEditModal(e, proj)}
					>EDIT</Button
				>
				<Button size="small" kind="danger-tertiary" on:click={(e) => handleOpenDeleteModal(e, proj)}
					>REMOVE</Button
				>
			</div>
		</div>
	{/each}
	<Button style="width: 300px; margin-top: 20px;" on:click={(e) => handleOpenEditModal(e)}
		>Add Project</Button
	>

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
		<FormGroup legendText="Name">
			<TextInput bind:value={project.name} placeholder="Please input project name" />
		</FormGroup>
		<FormGroup legendText="Build Servers">
			{#each project.buildServers as server, i}
				<FormGroup legendText={`Server ${i + 1}`} style="margin-bottom: 0;">
					<div class="server-item-row">
						<TextInput bind:value={server.name} placeholder="Please input server name" />
						<Button
							kind="danger-tertiary"
							style="margin-left: 10px;"
							size="small"
							on:click={() => handleRemoveBuildServer(i)}
						>
							Remove
						</Button>
					</div>
					<div class="server-item-row">
						<TextInput bind:value={server.host} placeholder="Please input server host" />
					</div>
				</FormGroup>
			{/each}
			<Button kind="tertiary" on:click={handleAddBuildServer}>Add Build Server</Button>
		</FormGroup>
		<FormGroup legendText="Deploy Servers">
			{#each project.deployServers as server, i}
				<FormGroup legendText={`Server ${i + 1}`} style="margin-bottom: 0;">
					<div class="server-item-row">
						<TextInput bind:value={server.name} placeholder="Please input server name" />
						<Button
							kind="danger-tertiary"
							style="margin-left: 10px;"
							size="small"
							on:click={() => handleRemoveDeployServer(i)}
						>
							Remove
						</Button>
					</div>
					<div class="server-item-row">
						<TextInput bind:value={server.host} placeholder="Please input server host" />
					</div>
					<div class="server-item-row">
						{#if server.currentNetwork}
							<TextInput bind:value={server.currentNetwork} disabled />
							<Button
								kind="danger-tertiary"
								style="margin-left: 10px;"
								size="small"
								on:click={() => handleRemoveNetwork(i)}
							>
								Remove
							</Button>
						{:else}
							{#if server.allNetworks}
								<Select on:change={(e) => handleSelectNetwork(e, i)}>
									{#each server.allNetworks as network}
										<SelectItem
											value={`${network.name}:${network.id}`}
											text={`${network.name}:${network.id}`}
										/>
									{/each}
								</Select>
							{/if}
							<Button
								kind="tertiary"
								style="margin-left: 10px;"
								size="small"
								on:click={() => handleAddNetwork(server, i)}
							>
								Add Network
							</Button>
						{/if}
					</div>
				</FormGroup>
			{/each}
			<Button kind="tertiary" on:click={handleAddDeployServer}>Add Deploy Server</Button>
		</FormGroup>
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
    width: 620px;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    margin-top: 100px;
	}

	h1 {
		font-weight: 700;
		margin-bottom: 20px;
	}

	.project-item {
		padding: 10px;
		border: 1px solid #ccc;
		width: 300px;
		cursor: pointer;
		transition: all 0.2s;
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

	.server-item-row {
		display: flex;
		margin-bottom: 10px;
	}
</style>
