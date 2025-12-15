<script lang="ts">
	import { Book } from '$lib/app/concepts/Book/Book.svelte';
	import { getBooks } from '$lib/app/apiFetch.svelte';
	import Heading from '$lib/designSystem/components/Heading/Heading.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import { goto } from '$app/navigation';

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
		<Button onclick={() => goto('/books/create')}>Create New Book</Button>
	</div>

	{#if loading}
		<p>Loading books...</p>
	{:else if books.length === 0}
		<p>No books found. Create one to get started!</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each books as book}
				<div class="flex flex-col gap-2 rounded-lg border p-4 shadow-sm">
					{#if book.cover?.imageLink}
						<img
							src={book.cover.imageLink}
							alt={book.title}
							class="aspect-[2/3] w-full rounded-md object-cover"
						/>
					{:else}
						<div
							class="flex aspect-[2/3] w-full items-center justify-center rounded-md bg-gray-100"
						>
							<span class="text-gray-400">No Cover</span>
						</div>
					{/if}
					<h3 class="mt-2 text-lg font-semibold">{book.title}</h3>
					<p class="text-sm text-gray-600">{book.author?.join(', ')}</p>
					<p class="text-xs text-gray-500">{book.chapters?.length ?? 0} chapters</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
