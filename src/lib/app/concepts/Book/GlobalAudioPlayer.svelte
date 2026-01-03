<script lang="ts">
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import PlayIcon from '$lib/designSystem/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/designSystem/icons/PauseIcon.svelte';
	import ChevronUpIcon from '$lib/designSystem/icons/ChevronDownIcon.svelte'; // Rotating down icon to act as Up

	import { globalPlayer } from './globalPlayer.svelte';
	import GlobalProgressView from './GlobalProgressView.svelte';
	import TimeView from './TimeView.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { Portal } from 'bits-ui';
	import { fly } from 'svelte/transition';
	import ChapterView from './ChapterView.svelte';
	import { Chapter } from './Book.svelte';

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

{#snippet miniPlayer()}
	<!-- Minimized PlayerBar -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={cc(
			'flex w-full cursor-pointer items-center gap-4 bg-stone-900 px-4 py-3 transition-colors hover:bg-stone-800',
			customClasses
		)}
		onclick={toggleExpand}
	>
		<!-- Play/Pause Button -->
		<Button
			class="h-10 w-10 shrink-0 rounded-full p-0 text-white hover:bg-white/10"
			onclick={(e) => {
				e.stopPropagation();
				if (globalPlayer.status !== 'playing') {
					globalPlayer.play();
				} else {
					globalPlayer.pause();
				}
			}}
		>
			{#if globalPlayer.status !== 'playing'}
				<PlayIcon class="h-6 w-6 fill-current" />
			{:else}
				<PauseIcon class="h-6 w-6 fill-current" />
			{/if}
		</Button>

		<!-- Info Area (Clickable to expand) -->
		<div class="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="truncate text-sm font-bold text-white">
					{globalPlayer.currentChapter?.title || 'Unknown Chapter'}
				</span>
				<span class="ml-2 shrink-0 text-xs text-stone-400">
					<TimeView seconds={globalPlayer.currentTime} /> / <TimeView
						seconds={globalPlayer.duration ?? 0}
					/>
				</span>
			</div>
			<GlobalProgressView class="h-1" />
		</div>
		{#if !expanded}
			<!-- Expand Button -->
			<Button
				variant="primary"
				class="h-10 w-10 shrink-0 rounded-full text-white/50 hover:text-white"
				onclick={toggleExpand}
			>
				<ChevronUpIcon class="font-bold" />
			</Button>
		{/if}
	</div>
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
