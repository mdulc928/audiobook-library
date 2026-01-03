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

	let isDragging = $state(false);
	let draggingTime = $state(0);

	let duration = $derived(globalPlayer.duration || 1);
	let displayTime = $derived(isDragging ? draggingTime : (globalPlayer.currentTime ?? 0));
	let displayPercent = $derived(clamp(displayTime / duration, 0, 1));

	let tooltipPercent = $derived.by(() => {
		const maxWidth = (wrapperElement?.clientWidth ?? 0) - (timerElementWidth ?? 0) / 2;
		const timerWidthPercent = (timerElementWidth ?? 0) / 2 / (wrapperElement?.clientWidth ?? 1);
		const adjusted = clamp(
			displayPercent,
			timerWidthPercent,
			maxWidth / (wrapperElement?.clientWidth ?? 1)
		);

		return adjusted * 100;
	});

	function scrubber(node: HTMLElement) {
		function getTimeFromEvent(e: PointerEvent) {
			const rect = node.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percent = clamp(x / rect.width, 0, 1);
			return percent * duration;
		}

		function onPointerDown(e: PointerEvent) {
			node.setPointerCapture(e.pointerId);
			isDragging = true;
			draggingTime = getTimeFromEvent(e);

			// Prevent default browser dragging or text selection
			e.preventDefault();

			node.addEventListener('pointermove', onPointerMove);
			node.addEventListener('pointerup', onPointerUp);
			node.addEventListener('pointercancel', onPointerUp);
		}

		function onPointerMove(e: PointerEvent) {
			if (!isDragging) return;
			e.preventDefault();
			draggingTime = getTimeFromEvent(e);
		}

		function onPointerUp(e: PointerEvent) {
			if (isDragging) {
				globalPlayer.seek(draggingTime);
				isDragging = false;
				node.releasePointerCapture(e.pointerId);
			}

			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
			node.removeEventListener('pointercancel', onPointerUp);
		}

		node.addEventListener('pointerdown', onPointerDown);

		return {
			destroy() {
				node.removeEventListener('pointerdown', onPointerDown);
				node.removeEventListener('pointermove', onPointerMove);
				node.removeEventListener('pointerup', onPointerUp);
				node.removeEventListener('pointercancel', onPointerUp);
			}
		};
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={cc('group relative flex grow cursor-pointer touch-none items-center py-2', customClass)}
	bind:this={wrapperElement}
	use:scrubber
>
	<Progress
		value={displayTime}
		min={0}
		max={duration}
		class="h-1 w-full transition-all group-hover:h-2"
	>
		{#snippet indicator()}
			<!-- Time Tooltip -->
			<Portal to={wrapperElement}>
				<button
					bind:clientWidth={timerElementWidth}
					class={cc(
						'pointer-events-none absolute top-0 -translate-x-1/2 -translate-y-full transition-opacity',
						isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
					)}
					style:left="{tooltipPercent}%"
				>
					<TimeView seconds={displayTime} class="rounded bg-black/80 px-1 text-xs " />
				</button>
			</Portal>
			<!-- Thumb -->
			<div
				class={cc(
					'pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow transition-all',
					isDragging
						? 'h-4 w-4 opacity-100'
						: 'h-2 w-2 opacity-0 group-hover:h-3 group-hover:w-3 group-hover:opacity-100'
				)}
				style:left="{displayPercent * 100}%"
			></div>
		{/snippet}
	</Progress>
</div>
