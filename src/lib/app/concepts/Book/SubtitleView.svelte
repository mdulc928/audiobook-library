<script lang="ts">
	import type { Subtitle } from './Book.svelte';

	let { subtitle }: { subtitle: Subtitle } = $props();
</script>

<p>
	{subtitle.text}
</p>
