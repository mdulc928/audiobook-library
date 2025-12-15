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
		d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z"
		clip-rule="evenodd"
	/>
</svg>
