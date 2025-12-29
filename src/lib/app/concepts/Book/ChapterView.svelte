<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { Chapter } from './Book.svelte';

	export type ChapterViewProps = {
		chapter: Chapter;
		class?: string;
		titleSnippet?: Snippet;
	};
</script>

<script lang="ts">
	import { Chapter as ChapterClass } from './Book.svelte';
	import ChapterAudioPlayer from './ChapterAudioPlayer.svelte';
	import ChapterImagePlayer from './ChapterImagePlayer.svelte';
	import ChapterSubtitlePlayer from './ChapterSubtitlePlayer.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { chapter, class: className, titleSnippet }: ChapterViewProps = $props();
</script>

<svelte:boundary>
	<div class={cc('flex h-full flex-col bg-black text-white', className)}>
		<!-- Title Area (custom or default) -->
		{#if titleSnippet}
			{@render titleSnippet()}
		{:else if chapter.title}
			<div class="flex items-center justify-center p-4">
				<h2 class="text-lg font-bold sm:text-xl">{chapter.title}</h2>
			</div>
		{/if}

		<!-- Main Visual Area -->
		<div class="relative flex flex-1 items-center justify-center p-4">
			<div
				class="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
			>
				<ChapterImagePlayer {chapter} class="h-full w-full" />
				<ChapterSubtitlePlayer {chapter} />
			</div>
		</div>

		<!-- Audio Player -->
		<div class="shrink-0 border-t border-white/10 bg-black/80 backdrop-blur-sm">
			<ChapterAudioPlayer {chapter} class="px-4 py-3" />
		</div>
	</div>
	{#snippet failed()}
		<div class="flex h-full items-center justify-center text-white/50">
			Sorry. Failed to Display Chapter
		</div>
	{/snippet}
</svelte:boundary>
