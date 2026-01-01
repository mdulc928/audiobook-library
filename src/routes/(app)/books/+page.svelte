<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getBooks, type BooksQueryState } from '$lib/app/api/books.svelte';
	import BookCollapsedView from '$lib/app/concepts/Book/BookCollapsedView.svelte';
	import Heading from '$lib/designSystem/components/Heading/Heading.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import { getGenres, type GenresQueryState } from '$lib/app/api/genres.svelte';

	let booksQuery = $state<BooksQueryState>();
	let genresQuery = $state<GenresQueryState>();

	onMount(async () => {
		genresQuery = await getGenres();
	});

	onMount(async () => {
		booksQuery = await getBooks();
	});
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-bg p-6">
	<div class="mb-6 flex items-center justify-between">
		<Heading level={3}>Books</Heading>
		<Button size="small" onclick={() => goto(resolve('/books/create'))}>Create Book</Button>
	</div>

	{#if booksQuery?.isPending || genresQuery?.isPending}
		<div class="flex h-40 w-full items-center justify-center">
			<LoaderIcon class="h-8 w-8 text-primary" />
		</div>
	{:else if booksQuery?.isError || genresQuery?.isError}
		<div class="flex h-40 w-full items-center justify-center text-error">
			<p>Failed to load books or genres.</p>
		</div>
	{:else if booksQuery?.data && booksQuery.data.length > 0}
		<!-- Vertical Scroll for Genres -->
		<div class="scrollbar-hide flex flex-col gap-8 overflow-y-auto pb-10">
			<!-- All Books Section -->
			<div class="flex flex-col gap-2">
				<div class="sticky top-0 z-10 bg-bg px-1 py-2">
					<Heading level={4}>All Books</Heading>
				</div>
				<!-- Horizontal Scroll Container -->
				<div class="scrollbar-hide -mx-4 flex snap-x snap-mandatory overflow-x-auto px-6 pb-4">
					<div class="flex gap-6">
						{#each booksQuery.data as book (book.id)}
							<div class="w-36 flex-none snap-start md:w-44">
								<BookCollapsedView {book} />
							</div>
						{/each}
					</div>
				</div>
			</div>

			{#if genresQuery?.data}
				{#each genresQuery.data as genre (genre.id)}
					{@const genreBooks = booksQuery.data.filter((b) => b.genres?.includes(genre.id!))}
					{#if genreBooks.length > 0}
						<div class="flex flex-col gap-2">
							<div class="sticky top-0 z-10 bg-bg px-1 py-2">
								<Heading level={4}>{genre.name}</Heading>
							</div>
							<!-- Horizontal Scroll Container -->
							<div
								class="scrollbar-hide -mx-4 flex snap-x snap-mandatory overflow-x-auto px-6 pb-4"
							>
								<div class="flex gap-6">
									{#each genreBooks as book (book.id)}
										<div class="w-36 flex-none snap-start md:w-44">
											<BookCollapsedView {book} />
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				{/each}
			{/if}

			<!-- Fallback for books with no genre or just to view all? User asked for genres list. -->
			<!-- Optionally we could add an "All Books" section or "Uncategorized" if needed, 
                 but the prompt specifically asked to list genres and books belonging to them. 
                 If a book has no genre, it won't appear here based on current logic. 
                 Use your judgement: The user said "list the genres and list the books that belong to the genres". 
                 I will stick to that. -->
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
