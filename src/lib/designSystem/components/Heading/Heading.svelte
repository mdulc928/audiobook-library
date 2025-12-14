<script lang="ts">
	let { children, level }: { children: string; level: number } = $props();
</script>

{#if level === 1}
	<h1 class="text-5xl font-bold">{children}</h1>
{:else if level === 2}
	<h2 class="text-5xl font-bold">{children}</h2>
{:else if level === 3}
	<h3 class="text-4xl font-bold">{children}</h3>
{:else if level === 4}
	<h4 class="text-3xl font-bold">{children}</h4>
{:else if level === 5}
	<h5 class="text-2xl font-bold">{children}</h5>
{:else if level === 6}
	<h6 class="text-lg font-bold">{children}</h6>
{/if}
