<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	type SingleSelectProps = {
		selected: T | undefined;
		onSelect: (item: T) => void;
	};
	type MultiSelectProps = {
		multiple: true;
		selected: T[];
		onSelect: (item: T) => void;
	};
	let {
		renderItem,
	}: {
		renderItem: Snippet<[T]>;
		selected: T | undefined;
		onSelect: (item: T) => void;
		multiple?: boolean;
	} & (SingleSelectProps | MultiSelectProps) = $props();
	let items = $state<T[]>([]);
</script>

<ul>
	{#each items as item, index (index)}
		<li>
			{@render renderItem(item)}
		</li>
	{/each}
</ul>
