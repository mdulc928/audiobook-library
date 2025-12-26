<script lang="ts">
	import type { Book } from './Book.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { book, class: className }: { book: Book; class?: string } = $props();
</script>

<div class={cc('group flex w-full flex-col gap-3', className)}>
	<!-- Cover Image Container -->
	<div
		class="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary/10 shadow-sm transition-shadow duration-300 group-hover:shadow-md"
	>
		{#await book.getCoverUrl()}
			<div class="h-full w-full animate-pulse bg-secondary/20"></div>
		{:then url}
			{#if url}
				<img
					src={url}
					alt={book.title}
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					loading="lazy"
				/>
			{:else}
				<div class="text-muted-foreground flex h-full w-full items-center justify-center">
					<span class="text-xs">No Cover</span>
				</div>
			{/if}
		{/await}
	</div>

	<!-- Book Info -->
	<div class="flex flex-col gap-1">
		<h3
			class="line-clamp-2 text-base leading-tight font-bold tracking-tight text-fg transition-colors group-hover:text-primary"
			title={book.title}
		>
			{book.title}
		</h3>
		<p class="text-muted-foreground line-clamp-1 text-sm font-medium">
			<span class="opacity-70">By:</span>
			{book.author?.join(', ') ?? 'Unknown'}
		</p>
	</div>
</div>
