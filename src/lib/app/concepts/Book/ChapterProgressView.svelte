<script lang="ts">
	import Progress from '$lib/designSystem/components/Progress/Progress.svelte';
	import type { Chapter } from './Book.svelte';
	import { Portal } from 'bits-ui';
	import TimeView from './TimeView.svelte';
	import { clamp } from 'es-toolkit';

	let { chapter }: { chapter: Chapter } = $props();
	let wrapperElement = $state<HTMLElement>();
	let timerElementWidth = $state<number>();
	let progressPercent = $derived.by(() => {
		const realPercent = clamp(
			(chapter.player.currentTime ?? 0) / (chapter.player.duration ?? 1),
			0,
			1
		);

		const maxWidth = (wrapperElement?.clientWidth ?? 0) - (timerElementWidth ?? 0) / 2;

		const timerWidthPercent = (timerElementWidth ?? 0) / 2 / (wrapperElement?.clientWidth ?? 1);
		const adjusted = clamp(
			realPercent,
			timerWidthPercent,
			maxWidth / (wrapperElement?.clientWidth ?? 1)
		);

		return adjusted * 100;
	});
</script>

<div class="relative flex grow items-center" bind:this={wrapperElement}>
	<Progress
		value={chapter.player.currentTime}
		min={0}
		max={chapter.player.duration}
		class="h-4 w-full"
	>
		{#snippet indicator()}
			<Portal to={wrapperElement}>
				<button
					bind:clientWidth={timerElementWidth}
					class="absolute top-0 -translate-x-1/2 -translate-y-full"
					style:left="{progressPercent}%"
				>
					<TimeView seconds={chapter.player.currentTime} class="rounded border px-1 text-xs" />
				</button>
			</Portal>
		{/snippet}
	</Progress>
</div>
