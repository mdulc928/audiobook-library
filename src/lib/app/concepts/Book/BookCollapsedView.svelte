<script lang="ts">
	import type { Book } from './Book.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { Popover } from 'bits-ui';
	import MoreVerticalIcon from '$lib/designSystem/icons/MoreVerticalIcon.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { deleteBook } from '$lib/app/api/books.svelte';
	import { toast } from '$lib/designSystem/components/Toast/toastManager.svelte';

	import { longPress } from '$lib/designSystem/actions/longPress';

	let { book, class: className }: { book: Book; class?: string } = $props();

	let popoverOpen = $state(false);

	async function handleDelete() {
		if (confirm('Are you sure you want to delete this book?')) {
			try {
				await deleteBook(book.id!);
				toast.success({ title: 'Book deleted' });
				// Reload page or invalidation would be better, but simple reload works for now or let parent handle it.
				// Since we are inside a list, we might want to trigger a refresh.
				// For now, reload.
				window.location.reload();
			} catch (error) {
				console.error(error);
				toast.error({ title: 'Failed to delete book' });
			}
		}
	}
</script>

<div class={cc('group relative flex w-full flex-col gap-3', className)}>
	<!-- Cover Image Container -->
	<div
		use:longPress={() => (popoverOpen = true)}
		class="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary/10 shadow-sm transition-shadow duration-300 group-hover:shadow-md"
	>
		{#await book.getCoverUrl()}
			<div class="h-full w-full animate-pulse bg-secondary/20"></div>
		{:then url}
			{#if url}
				<img
					src={url}
					alt={book.title}
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					loading="lazy"
				/>
			{:else}
				<div class="text-muted-foreground flex h-full w-full items-center justify-center">
					<span class="text-xs">No Cover</span>
				</div>
			{/if}
		{/await}

		<!-- Menu Trigger -->
		<div
			class="opacity- absolute top-2 right-2 z-10 transition-opacity md:opacity-0 md:group-hover:opacity-100"
		>
			<Popover.Root bind:open={popoverOpen}>
				<Popover.Trigger
					class="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
				>
					<MoreVerticalIcon class="h-5 w-5" />
				</Popover.Trigger>
				<Popover.Content
					class="min-w-[140px] rounded-lg border border-border bg-bg p-1 shadow-lg outline-none"
					side="bottom"
					align="end"
					sideOffset={5}
				>
					<div class="flex flex-col gap-0.5">
						<button
							class="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm text-fg transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
							onclick={() => goto(resolve(`/books/${book.id}/edit`))}
						>
							Edit
						</button>
						<button
							class="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm text-error transition-colors hover:bg-error/10 focus:bg-error/10 focus:outline-none"
							onclick={handleDelete}
						>
							Delete
						</button>
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
	</div>

	<!-- Book Info -->
	<div class="flex flex-col gap-1">
		<h3
			class="line-clamp-2 text-base leading-tight font-bold tracking-tight text-fg transition-colors group-hover:text-primary"
			title={book.title}
		>
			{book.title}
		</h3>
		<p class="text-muted-foreground line-clamp-1 text-sm font-medium">
			<span class="opacity-70">By:</span>
			{book.author?.join(', ') ?? 'Unknown'}
		</p>
	</div>
</div>
