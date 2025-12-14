<script lang="ts">
	import { Toast } from '@skeletonlabs/skeleton-svelte';
	import { toast } from './toastFunctions.svelte';
</script>

<Toast.Group toaster={toast}>
	{#snippet children(toast)}
		<Toast {toast}>
			<Toast.Message>
				<Toast.Title>{toast.title}</Toast.Title>
				<Toast.Description>{toast.description}</Toast.Description>
			</Toast.Message>
			{#if toast.action}
				<Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
			{/if}
			{#if toast.closable}
				<Toast.CloseTrigger />
			{/if}
		</Toast>
	{/snippet}
</Toast.Group>
