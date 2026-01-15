<script lang="ts">
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import PlayIcon from '$lib/designSystem/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/designSystem/icons/PauseIcon.svelte';
	import ChevronUpIcon from '$lib/designSystem/icons/ChevronDownIcon.svelte';

	import TimeView from './TimeView.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import type { Snippet } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface AudioPlayerProps {
		class?: ClassValue;
		title?: string;
		currentTime: number;
		duration: number;
		isPlaying: boolean;
		onPlay: () => void;
		onPause: () => void;
		onClick?: () => void;
		showExpandButton?: boolean;
		onExpand?: () => void;
		progressSnippet?: Snippet;
	}

	let {
		class: customClasses,
		title = m.unknown_chapter(),
		currentTime,
		duration,
		isPlaying,
		onPlay,
		onPause,
		onClick,
		showExpandButton = false,
		onExpand,
		progressSnippet
	}: AudioPlayerProps = $props();

	function handleClick() {
		if (onClick) {
			onClick();
		}
	}

	function handlePlayPause() {
		if (isPlaying) {
			onPause();
		} else {
			onPlay();
		}
	}

	function handleExpand() {
		onExpand?.();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={cc(
		'flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-stone-900 px-4 py-3 transition-colors hover:bg-stone-800',
		customClasses
	)}
	onclick={handleClick}
>
	<!-- Play/Pause Button -->
	<Button
		class="h-10 w-10 shrink-0 rounded-full p-0 text-white hover:bg-white/10"
		onclick={handlePlayPause}
	>
		{#if !isPlaying}
			<PlayIcon class="h-6 w-6 fill-white" />
		{:else}
			<PauseIcon class="h-6 w-6 fill-white" />
		{/if}
	</Button>

	<!-- Info Area (Clickable to expand) -->
	<div class="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
		<div class="flex items-center justify-between">
			<span class="truncate text-sm font-bold text-white">
				{title}
			</span>
			<span class="ml-2 shrink-0 text-xs text-stone-400">
				<TimeView seconds={currentTime} /> / <TimeView seconds={duration} />
			</span>
		</div>
		{#if progressSnippet}
			{@render progressSnippet()}
		{/if}
	</div>
	{#if showExpandButton}
		<!-- Expand Button -->
		<Button
			variant="primary"
			class="h-10 w-10 shrink-0 rounded-full text-white/50 hover:text-white"
			onclick={handleExpand}
		>
			<ChevronUpIcon class="font-bold" />
		</Button>
	{/if}
</div>
