<script lang="ts">
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import PlayIcon from '$lib/designSystem/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/designSystem/icons/PauseIcon.svelte';

	import { Chapter } from './Book.svelte';
	import ChapterProgressView from './ChapterProgressView.svelte';
	import TimeView from './TimeView.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { chapter, class: customClasses }: { chapter: Chapter; class?: ClassValue } = $props();
</script>

<div class={cc('flex w-full flex-row items-end gap-2 px-2 py-3', customClasses)}>
	<Button
		onclick={() => {
			if (chapter.player.status !== 'playing') {
				chapter.player.play();
			} else {
				chapter.player.pause();
			}
		}}
	>
		{#if chapter.player.status !== 'playing'}
			<PlayIcon />
		{:else}
			<PauseIcon />
		{/if}
	</Button>

	<div class="item-center flex w-full gap-1">
		<ChapterProgressView {chapter} />
		<div class="flex items-center">
			<TimeView seconds={chapter.player.duration ?? 0} />
		</div>
	</div>
</div>
