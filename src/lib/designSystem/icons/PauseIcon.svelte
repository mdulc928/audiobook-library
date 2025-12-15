<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { class: className = '', ...rest }: SVGAttributes<SVGElement> = $props();
</script>

<svg
	class={cc('h-4 w-4', className)}
	viewBox="0 0 20 20"
	fill="currentColor"
	aria-hidden="true"
	{...rest}
>
	<path
		fill-rule="evenodd"
		d="M6.75 3.5A1.5 1.5 0 0 0 5.25 5v10a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5V5A1.5 1.5 0 0 0 8.25 3.5h-1.5ZM13.75 3.5A1.5 1.5 0 0 0 12.25 5v10a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5V5a1.5 1.5 0 0 0-1.5-1.5h-1.5Z"
		clip-rule="evenodd"
	/>
</svg>

