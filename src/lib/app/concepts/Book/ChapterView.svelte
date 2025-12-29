<script lang="ts">
	import { Chapter } from './Book.svelte';
	import ChapterAudioPlayer from './ChapterAudioPlayer.svelte';
	import ChapterImagePlayer from './ChapterImagePlayer.svelte';
	import ChapterSubtitlePlayer from './ChapterSubtitlePlayer.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let {
		chapter,
		class: className,
		showTitle = true
	}: { chapter: Chapter; class?: string; showTitle?: boolean } = $props();
</script>

<svelte:boundary>
	<div class={cc('flex h-full flex-col bg-black text-white', className)}>
		<!-- Title Bar -->
		{#if showTitle && chapter.title}
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
