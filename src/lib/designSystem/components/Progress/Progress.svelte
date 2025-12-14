<script lang="ts">
	import { Progress, useId } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	let {
		max = 100,
		value = 0,
		min = 0,
		label,
		valueLabel
	}: ComponentProps<typeof Progress.Root> & {
		label?: string;
		valueLabel?: string;
	} = $props();

	const labelId = useId();
</script>

<div>
	<span id={labelId}> {label} </span>
	<span>{valueLabel}</span>
</div>
<Progress.Root aria-labelledby={labelId} aria-valuetext={valueLabel} {value} {min} {max} />
