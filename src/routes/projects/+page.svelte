<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const projects = data.projects ?? [];
</script>

<div>
	<h1>Projects</h1>
	{#each projects as proj}
		<div>
			Name: <b>{proj.name}</b>
			<ul>
				<li>
					<span style="margin-left: 20px">
						<a href={'/pipelines?pid=' + proj.id}>View pipelines</a>
					</span>
				</li>
			</ul>
		</div>
		<hr />
	{/each}
</div>
