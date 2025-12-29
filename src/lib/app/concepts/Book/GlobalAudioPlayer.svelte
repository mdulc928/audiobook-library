<script lang="ts">
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import PlayIcon from '$lib/designSystem/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/designSystem/icons/PauseIcon.svelte';

	import { globalPlayer } from './globalPlayer.svelte';
	import GlobalProgressView from './GlobalProgressView.svelte';
	import TimeView from './TimeView.svelte';
	import type { ClassValue } from 'svelte/elements';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { class: customClasses }: { class?: ClassValue } = $props();
</script>

<div class={cc('flex w-full flex-row items-end gap-2 px-2 py-3', customClasses)}>
	<Button
		onclick={() => {
			if (globalPlayer.status !== 'playing') {
				globalPlayer.play();
			} else {
				globalPlayer.pause();
			}
		}}
	>
		{#if globalPlayer.status !== 'playing'}
			<PlayIcon />
		{:else}
			<PauseIcon />
		{/if}
	</Button>

	<div class="item-center flex w-full gap-1">
		<GlobalProgressView />
		<div class="flex items-center">
			<TimeView seconds={globalPlayer.duration ?? 0} />
		</div>
	</div>
</div>
