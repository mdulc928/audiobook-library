<script lang="ts">
	import Progress from '$lib/designSystem/components/Progress/Progress.svelte';
	import type { Chapter } from './Book.svelte';
	import { Portal } from 'bits-ui';
	import TimeView from './TimeView.svelte';
	import { clamp } from 'es-toolkit';

	let { chapter }: { chapter: Chapter } = $props();
	let progressPercent = $derived.by(() => {
		return clamp((chapter.player.currentTime ?? 0) / (chapter.player.duration ?? 1), 0, 1) * 100;
	});
	let wrapperElement = $state<HTMLElement>();
</script>

<div class="relative flex w-full" bind:this={wrapperElement}>
	<Progress
		value={chapter.player.currentTime}
		min={0}
		max={chapter.player.duration}
		class="h-4 w-full"
	>
		{#snippet indicator({ parentElement })}
			<Portal to={wrapperElement}>
				<button
					class="absolute top-0 -translate-x-1/2 -translate-y-full"
					style:left="{progressPercent}%"
				>
					<TimeView seconds={chapter.player.currentTime} class="rounded border px-1 text-xs" />
				</button>
			</Portal>
		{/snippet}
	</Progress>
</div>
