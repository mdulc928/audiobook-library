<script lang="ts">
	import { Book } from '$lib/app/concepts/Book/Book.svelte';
	import { getBooks } from '$lib/app/apiFetch.svelte';
	import Heading from '$lib/designSystem/components/Heading/Heading.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import BookView from '$lib/app/concepts/Book/BookView.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let books: Book[] = $state([]);
	let loading = $state(true);

	$effect(() => {
		getBooks()
			.then((data) => {
				books = data;
			})
			.catch((error) => {
				console.error('Error fetching books:', error);
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<div class="container mx-auto max-w-4xl py-8">
	<div class="mb-6 flex items-center justify-between">
		<Heading>My Books</Heading>
		<Button onclick={() => goto(resolve('/books/create'))}>Create New Book</Button>
	</div>

	{#if loading}
		<p>Loading books...</p>
	{:else if books.length === 0}
		<p>No books found. Create one to get started!</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each books as book (book.id)}
				<BookView {book} />
			{/each}
		</div>
	{/if}
</div>
