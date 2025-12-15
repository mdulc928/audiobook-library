<script lang="ts">
	import type { BookImage } from './Book.svelte';

	let { bookImage }: { bookImage: BookImage } = $props();
</script>

<svelte:boundary>
	{#if bookImage.imageLink}
		<div class="grid">
			<enhanced:img src={bookImage.imageLink} class="h-full max-w-full" alt={bookImage.alt} />
		</div>
	{/if}
	{#snippet failed()}
		<div>Could not load image;</div>
	{/snippet}
</svelte:boundary>
