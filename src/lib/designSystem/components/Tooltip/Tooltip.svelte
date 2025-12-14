<script lang="ts">
	import { Tooltip, Portal, type TooltipRootProps } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';
	import { cc } from '../../utils/miscellaneous';
	let {
		children,
		content,
		position
	}: {
		children: Snippet<[]>;
		content: Snippet<[]>;
		position: NonNullable<TooltipRootProps['positioning']>['placement'];
	} = $props();
</script>

<Tooltip positioning={{ placement: position }}>
	<Tooltip.Trigger class={cc('p-2')}>
		{@render children()}
	</Tooltip.Trigger>
	<Portal>
		<Tooltip.Positioner>
			<Tooltip.Content class="card preset-filled-surface-950-50 p-2">
				{@render content()}
			</Tooltip.Content>
		</Tooltip.Positioner>
	</Portal>
</Tooltip>
