<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { class: className = '', ...rest }: SVGAttributes<SVGElement> = $props();
</script>

<svg
	class={cc('h-8 w-8', className)}
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	aria-hidden="true"
	{...rest}
>
	<path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
</svg>
