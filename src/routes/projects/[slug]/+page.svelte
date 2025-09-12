<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const project = data.project;
	const users = data.users ?? [];
</script>

<div>
	<h1>Project Details</h1>
	{#if project}
		<div>
			Name: <b>{project.name}</b>
			<ul>
				<li>ID: {project.id}</li>
				<li>
					Members:
					<ul>
						{#each users as u}
							<li class="userItem">
								{#if u?.avatarUrl}
									<img class="avatar" alt="avatar" src={u.avatarUrl} />
									<span class="padding10"></span>
								{/if}
								<span> {u.name || '(NA)'}</span>
							</li>
							<div class="padding5"></div>
						{/each}
						<div class="padding5"></div>
					</ul>
				</li>
				<li>
					<a href={'/pipelines?pid=' + project.id}>View pipelines</a>
				</li>
			</ul>
		</div>
	{/if}
</div>

<style>
	.userItem {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 20px;
	}

	.padding5 {
		width: 5px;
		height: 5px;
	}

	.padding10 {
		width: 10px;
		height: 10px;
	}
</style>
