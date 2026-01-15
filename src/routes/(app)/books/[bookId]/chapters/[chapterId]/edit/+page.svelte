<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getBook } from '$lib/app/api/books.svelte';
	import type { Book } from '$lib/app/concepts/Book/Book.svelte';
	import ChapterEditor from '$lib/app/concepts/Book/ChapterEditor.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let book = $state<Book>();
	let loading = $state(true);
	let error = $state<string>();

	const bookId = page.params.bookId || '';
	const chapterId = page.params.chapterId || '';

	onMount(async () => {
		try {
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

<div class="h-full w-full bg-background text-foreground">
	{#if loading}
		<div class="flex h-full w-full items-center justify-center">
			<LoaderIcon class="h-8 w-8 animate-spin text-primary" />
		</div>
	{:else if error}
		<div class="flex h-full w-full items-center justify-center text-error">
			<p>{error}</p>
		</div>
	{:else if book}
		{#key chapterId}
			<ChapterEditor {book} {chapterId} />
		{/key}
	{:else}
		<div class="flex h-full w-full items-center justify-center">
			<p>{m.book_not_found()}</p>
		</div>
	{/if}
</div>
