<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import BookCoverEditor from '$lib/app/concepts/Book/BookCoverEditor.svelte';
	import { getBook } from '$lib/app/api/books.svelte';
	import type { Book } from '$lib/app/concepts/Book/Book.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let book = $state<Book>();
	let loading = $state(true);
	let error = $state<string>();

	onMount(async () => {
		try {
			const bookId = page.params.bookId;
			if (bookId) {
				book = await getBook(bookId);
			} else {
				error = m.no_book_id();
			}
		} catch (e) {
			console.error(e);
			error = m.failed_to_load_book();
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="flex h-full w-full items-center justify-center">
		<LoaderIcon class="h-8 w-8 animate-spin text-primary" />
	</div>
{:else if error}
	<div class="flex h-full w-full items-center justify-center text-error">
		<p>{error}</p>
	</div>
{:else if book}
	<BookCoverEditor {book} />
{:else}
	<div class="flex h-full w-full items-center justify-center">
		<p>{m.book_not_found()}</p>
	</div>
{/if}
