<script lang="ts">
	import Progress from '$lib/designSystem/components/Progress/Progress.svelte';
	import { Portal } from 'bits-ui';
	import TimeView from './TimeView.svelte';
	import { clamp } from 'es-toolkit';
	import { globalPlayer } from './globalPlayer.svelte';

	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { class: customClass }: { class?: string } = $props();
	let wrapperElement = $state<HTMLElement>();
	let timerElementWidth = $state<number>();
	let progressPercent = $derived.by(() => {
		const realPercent = clamp((globalPlayer.currentTime ?? 0) / (globalPlayer.duration || 1), 0, 1);

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

<div class={cc('relative flex grow items-center', customClass)} bind:this={wrapperElement}>
	<Progress
		value={globalPlayer.currentTime}
		min={0}
		max={globalPlayer.duration || 1}
		class="h-4 w-full"
	>
		{#snippet indicator()}
			<Portal to={wrapperElement}>
				<button
					bind:clientWidth={timerElementWidth}
					class="absolute top-0 -translate-x-1/2 -translate-y-full"
					style:left="{progressPercent}%"
				>
					<TimeView seconds={globalPlayer.currentTime} class="rounded border px-1 text-xs" />
				</button>
			</Portal>
		{/snippet}
	</Progress>
</div>
