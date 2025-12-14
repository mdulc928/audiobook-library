<script lang="ts">
	let { seconds, minutes, hours }: { seconds: number; minutes?: number; hours?: number } = $props();

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

<div class="inline-flex gap-1">
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
