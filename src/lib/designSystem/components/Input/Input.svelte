<script lang="ts">
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		class: className,
		value = $bindable(),
		...rest
	}: {
		class?: string;
		value?: string | number;
	} & HTMLInputAttributes = $props();
</script>

<input
	class={cc(
		'border-input focus-visible:ring-ring ring-offset-bgfile:border-0 flex h-10 w-full rounded-md border bg-bg px-3 py-2 text-sm file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	{...rest}
/>
