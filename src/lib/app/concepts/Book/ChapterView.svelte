<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { Chapter } from './Book.svelte';

	export type ChapterViewProps = {
		chapter: Chapter;
		class?: string;
		titleSnippet?: Snippet;
		useGlobalPlayer?: boolean;
	};
</script>

<script lang="ts">
	import ChapterAudioPlayer from './ChapterAudioPlayer.svelte';
	import GlobalAudioPlayer from './GlobalAudioPlayer.svelte';
	import ChapterImagePlayer from './ChapterImagePlayer.svelte';
	import ChapterSubtitlePlayer from './ChapterSubtitlePlayer.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let {
		chapter,
		class: className,
		titleSnippet,
		useGlobalPlayer = false
	}: ChapterViewProps = $props();
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
				<ChapterImagePlayer {chapter} {useGlobalPlayer} class="h-full w-full" />
				<ChapterSubtitlePlayer {chapter} {useGlobalPlayer} />
			</div>
		</div>

		<!-- Audio Player -->
		<div class="shrink-0 border-t border-white/10 bg-black/80 backdrop-blur-sm">
			{#if useGlobalPlayer}
				<GlobalAudioPlayer class="px-4 py-3" />
			{:else}
				<ChapterAudioPlayer {chapter} class="px-4 py-3" />
			{/if}
		</div>
	</div>
	{#snippet failed()}
		<div class="flex h-full items-center justify-center text-white/50">
			Sorry. Failed to Display Chapter
		</div>
	{/snippet}
</svelte:boundary>
