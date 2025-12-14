<script lang="ts">
	import { Popover } from 'bits-ui';
	import type { Snippet } from 'svelte';
	let {
		children,
		content,
		open = $bindable(false),
		anchor
	}: {
		children: Snippet<[]>;
		content: Snippet<[]>;
		anchor?: Popover.PortalProps['to'];
		open: boolean;
	} = $props();
</script>

<Popover.Root bind:open>
	{#if children}
		<Popover.Trigger>{@render children()}</Popover.Trigger>
	{/if}
	<Popover.Portal to={anchor}>
		<Popover.Content>
			{@render content()}
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
