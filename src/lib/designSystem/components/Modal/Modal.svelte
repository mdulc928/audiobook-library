<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import Heading from '../Heading/Heading.svelte';
	let {
		children,
		content,
		header,
		open = $bindable(false)
	}: {
		children: Snippet<[]>;
		content: Snippet<[]>;
		header?: Snippet<[]>;
		open?: boolean;
	} = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{@render children()}
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Content>
			{#if header}
				<Dialog.Title>
					<Heading level={3}>
						{@render header()}
					</Heading>
				</Dialog.Title>
			{/if}

			<Dialog.Description>
				{@render content()}
			</Dialog.Description>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
