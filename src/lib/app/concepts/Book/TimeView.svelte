<script lang="ts">
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import type { ClassValue } from 'svelte/elements';

	let {
		seconds,
		minutes,
		hours,
		class: customClasses
	}: { seconds: number; minutes?: number; hours?: number; class?: ClassValue } = $props();

	let resolved = $derived.by((): { seconds: number; minutes: number; hours: number } => {
		const [minutesCovered, remainedSecs] = [Math.floor((seconds ?? 0) / 60), (seconds ?? 0) % 60];
		const [hoursCovered, remainedMins] = [
			Math.floor(((minutes ?? 0) + minutesCovered) / 60),
			((minutes ?? 0) + minutesCovered) % 60
		];
		return {
			seconds: remainedSecs,
			minutes: remainedMins,
			hours: (hours ?? 0) + hoursCovered
		};
	});
</script>

<div class={cc('inline-flex gap-1', customClasses)}>
	{resolved.hours.toLocaleString(undefined, {
		useGrouping: false,
		minimumIntegerDigits: 2,
		maximumFractionDigits: 0
	})}<span>:</span>{resolved.minutes.toLocaleString(undefined, {
		useGrouping: false,
		minimumIntegerDigits: 2,
		maximumFractionDigits: 0,
		maximumSignificantDigits: 2
	})}<span>:</span>{resolved.seconds.toLocaleString(undefined, {
		useGrouping: false,
		minimumIntegerDigits: 2,
		maximumFractionDigits: 3,
		maximumSignificantDigits: 2
	})}
</div>
