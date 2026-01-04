<script lang="ts">
	import ChapterImagePlayer from './ChapterImagePlayer.svelte';
	import ChapterSubtitlePlayer from './ChapterSubtitlePlayer.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import type { Snippet } from 'svelte';
	import type { Chapter } from './Book.svelte';
	import AudioPlayer from './AudioPlayer.svelte';
	import PlayerProgressView from './PlayerProgressView.svelte';

	type ChapterViewProps = {
		chapter: Chapter;
		class?: string;
		titleSnippet?: Snippet;
		useGlobalPlayer?: boolean;
		player?: Snippet<[]>;
	};
	let {
		chapter,
		class: className,
		titleSnippet,
		useGlobalPlayer = false,
		player
	}: ChapterViewProps = $props();
</script>

<!-- <svelte:boundary> -->
<div class={cc('relative flex h-full flex-col bg-black text-white', className)}>
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
			class="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
		>
			<ChapterImagePlayer {chapter} {useGlobalPlayer} class="h-full w-full" />
		</div>
	</div>
	<ChapterSubtitlePlayer {chapter} {useGlobalPlayer} class="absolute right-0 bottom-20 left-0" />

	<!-- Audio Player -->
	<div class="shrink-0 border-t border-white/10 bg-black/80 backdrop-blur-sm">
		{#if useGlobalPlayer && player}
			{@render player()}
		{:else if chapter.player.isInitialized}
			<AudioPlayer
				class="px-4 py-3"
				title={chapter.title}
				currentTime={chapter.player.currentTime}
				duration={chapter.player.duration}
				isPlaying={chapter.player.status === 'playing'}
				onPlay={() => chapter.player.play()}
				onPause={() => chapter.player.pause()}
			>
				{#snippet progressSnippet()}
					<PlayerProgressView player={chapter.player} />
				{/snippet}
			</AudioPlayer>
		{/if}
	</div>
</div>
<!-- {#snippet failed()}
		<div class="flex h-full items-center justify-center text-white/50">
			Sorry. Failed to Display Chapter
		</div>
	{/snippet} -->
<!-- </svelte:boundary> -->
