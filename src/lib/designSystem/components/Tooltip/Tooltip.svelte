<script lang="ts">
	import { Tooltip, Portal, type TooltipContentProps } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cc } from '../../utils/miscellaneous';
	let {
		children,
		content,
		position
	}: {
		children: Snippet<[]>;
		content: Snippet<[]>;
		position: TooltipContentProps['side'];
	} = $props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger class={cc('p-2')}>
		{@render children()}
	</Tooltip.Trigger>
	<Portal>
		<Tooltip.Content
			sideOffset={8}
			class="z-50 rounded-sm bg-surface-950 px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
			side={position}
		>
			{@render content()}
		</Tooltip.Content>
	</Portal>
</Tooltip.Root>
