<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

	let { class: className = '', ...rest }: HTMLAttributes<HTMLSpanElement> = $props();
</script>

<span aria-hidden="true" class={cc(className)} {...rest}>→</span>
