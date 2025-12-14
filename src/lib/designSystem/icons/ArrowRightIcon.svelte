<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cm } from '$lib/utils';

	let { class: className = '', ...rest }: HTMLAttributes<HTMLSpanElement> = $props();
</script>

<span aria-hidden="true" class={cm(className)} {...rest}>→</span>
