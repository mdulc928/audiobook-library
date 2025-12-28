<script lang="ts">
	import type { Chapter } from './Book.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { chapter, class: className }: { chapter: Chapter; class?: string } = $props();

	let currentImage = $derived.by(() => {
		if (!chapter || !chapter.player) return undefined;
		const time = chapter.player.currentTime;
		return chapter.images?.find((img) => {
			const start = img.timestamp ?? 0;
			const end = start + (img.duration ?? 0);
			return time >= start && time < end;
		});
	});
</script>

<div class={cc('relative h-full w-full overflow-hidden bg-black', className)}>
	{#if currentImage?.imageLink}
		<img
			src={currentImage.imageLink}
			alt="Chapter Visual"
			class="object-fit h-full w-full transition-opacity duration-300"
		/>
	{:else}
		<div class="flex h-full w-full items-center justify-center text-white/30">
			<span class="text-2xl font-bold">No Visual</span>
		</div>
	{/if}
</div>
