<script lang="ts">
	import ChevronUpIcon from '$lib/designSystem/icons/ChevronDownIcon.svelte'; // Rotating down icon to act as Up

	import { globalPlayer } from './globalPlayer.svelte';
	import GlobalProgressView from './PlayerProgressView.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { Portal } from 'bits-ui';
	import { fly } from 'svelte/transition';
	import ChapterView from './ChapterView.svelte';
	import { Chapter } from './Book.svelte';
	import AudioPlayer from './AudioPlayer.svelte';

	let { class: customClasses }: { class?: ClassValue } = $props();

	let currentChapter = $derived(
		globalPlayer.currentChapter ? new Chapter(globalPlayer.currentChapter) : undefined
	);

	let expanded = $state(false);

	function toggleExpand(e?: Event) {
		e?.stopPropagation();
		expanded = !expanded;
	}
</script>

{#snippet progressBar()}
	<GlobalProgressView class="h-1" player={globalPlayer} />
{/snippet}

{#snippet miniPlayer()}
	<AudioPlayer
		class={customClasses}
		title={globalPlayer.currentChapter?.title || 'Unknown Chapter'}
		currentTime={globalPlayer.currentTime}
		duration={globalPlayer.duration ?? 0}
		isPlaying={globalPlayer.status === 'playing'}
		onPlay={() => globalPlayer.play()}
		onPause={() => globalPlayer.pause()}
		onClick={toggleExpand}
		showExpandButton={!expanded}
		onExpand={toggleExpand}
		progressSnippet={progressBar}
	/>
{/snippet}

{#if expanded && currentChapter}
	<Portal>
		<div
			class="animate-in slide-in-from-bottom fixed inset-0 z-100 flex flex-col bg-black duration-300"
			transition:fly={{ y: '100%', duration: 300 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-4 py-2">
				<button class="p-2 text-white/50 hover:text-white" onclick={toggleExpand}>
					<ChevronUpIcon class="h-8 w-8" />
				</button>
				<span class="text-sm font-medium text-white/70">Now Playing</span>
				<div class="w-8"></div>
				<!-- Spacer -->
			</div>

			<!-- Main Content -->
			<div class="flex-1 overflow-hidden">
				<ChapterView chapter={currentChapter} useGlobalPlayer={true} class="h-full">
					{#snippet player()}
						{@render miniPlayer()}
					{/snippet}
				</ChapterView>
			</div>
		</div>
	</Portal>
{/if}

{@render miniPlayer()}
