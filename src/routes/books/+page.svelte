<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getBooks } from '$lib/app/api/books.svelte';
	import type { BooksQueryState } from '$lib/app/api/books.svelte';
	import BookCollapsedView from '$lib/app/concepts/Book/BookCollapsedView.svelte';
	import Heading from '$lib/designSystem/components/Heading/Heading.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';

	let booksQuery = $state<BooksQueryState>();

	onMount(async () => {
		booksQuery = await getBooks();
	});
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-bg p-6">
	<div class="mb-6 flex items-center justify-between">
		<Heading level={3}>Books</Heading>
		<Button size="small" onclick={() => goto(resolve('/books/create'))}>Create Book</Button>
	</div>

	{#if booksQuery?.isPending}
		<div class="flex h-40 w-full items-center justify-center">
			<LoaderIcon class="h-8 w-8 text-primary" />
		</div>
	{:else if booksQuery?.isError}
		<div class="flex h-40 w-full items-center justify-center text-error">
			<p>Failed to load books.</p>
		</div>
	{:else if booksQuery?.data && booksQuery.data.length > 0}
		<!-- Horizontal Scroll Container -->
		<div class="scrollbar-hide -mx-4 flex snap-x snap-mandatory overflow-x-auto px-6 pb-4">
			<div class="flex gap-6">
				{#each booksQuery.data as book}
					<div class="w-36 flex-none snap-start md:w-44">
						<BookCollapsedView {book} />
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-muted-foreground flex h-40 w-full flex-col items-center justify-center gap-4">
			<p>No books found.</p>
			<Button variant="secondary" onclick={() => goto(resolve('/books/create'))}>
				Create your first book
			</Button>
		</div>
	{/if}
</div>
