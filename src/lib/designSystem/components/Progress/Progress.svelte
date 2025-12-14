<script lang="ts">
	import { Progress, useId } from 'bits-ui';
	import type { ComponentProps, Snippet } from 'svelte';
	import { cc } from '../../utils/miscellaneous';
	import { Spring } from 'svelte/motion';

	let {
		max = 100,
		value = 0,
		min = 0,
		label,
		valueLabel,
		children,
		class: customClasses
	}: ComponentProps<typeof Progress.Root> & {
		label?: string;
		valueLabel?: string;
		children?: Snippet<[]>;
	} = $props();

	const labelId = useId();

	// Calculate the target percentage for the progress bar
	const targetPercentage = $derived.by(() => {
		const range = max - min;
		let result = 0;

		if (value !== null && value !== undefined && range !== 0) {
			const normalizedValue = value - min;
			result = (normalizedValue / range) * 100;
			// Ensure result is a valid number
			if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
				result = 0;
			}
			// Clamp between 0 and 100
			result = Math.max(0, Math.min(100, result));
		}

		return result;
	});

	// Use Spring.of to automatically track targetPercentage
	// This ensures the spring stays in sync with the target value
	const spring = Spring.of(() => targetPercentage, {
		stiffness: 0.15,
		damping: 0.8
	});

	// Calculate the transform translateX value
	// The bar should fill from left to right, so we translate by the inverse percentage
	const translateX = $derived.by(() => {
		const current = spring.current;
		// Ensure we have a valid number, defaulting to 100 (fully hidden) if invalid
		if (typeof current !== 'number' || isNaN(current) || !isFinite(current)) {
			return 100;
		}
		// Clamp between 0 and 100 to ensure valid CSS values
		const percentage = Math.max(0, Math.min(100, current));
		return 100 - percentage;
	});
	$inspect(min, max);
</script>

{#if label || valueLabel}
	<div>
		{#if label}
			<span id={labelId}> {label} </span>
		{/if}
		{#if valueLabel}
			<span>{valueLabel}</span>
		{/if}
	</div>
{/if}
<Progress.Root
	aria-labelledby={label ? labelId : undefined}
	aria-valuetext={valueLabel}
	{value}
	{min}
	{max}
	class={cc(
		'relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
		customClasses
	)}
>
	<div
		class="h-full w-full rounded-full bg-primary"
		style={`transform: translateX(-${translateX}%)`}
	></div>
</Progress.Root>
