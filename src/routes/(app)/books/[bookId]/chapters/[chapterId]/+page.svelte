<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getBook } from '$lib/app/api/books.svelte';
	import type { Book, Chapter } from '$lib/app/concepts/Book/Book.svelte';
	import ChapterView from '$lib/app/concepts/Book/ChapterView.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import { globalPlayer } from '$lib/app/concepts/Book/globalPlayer.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let book = $state<Book>();
	let chapter = $state<Chapter>();
	let loading = $state(true);
	let error = $state<string>();

	const bookId = page.params.bookId || '';
	const chapterId = page.params.chapterId || '';

	onMount(async () => {
		try {
			if (bookId) {
				book = await getBook(bookId);
				chapter = book?.chapters?.find((c) => c.id === chapterId);
				if (!chapter) {
					error = m.chapter_not_found();
				}
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

{#snippet titleBar()}
	<div class="flex w-full items-center justify-between p-4">
		<Button
			variant="secondary"
			class="bg-black/20 text-white backdrop-blur-md"
			onclick={() => {
				// Stop playing when going back
				// globalPlayer.stop();
				goto(resolve(`/books/${bookId}`));
			}}
		>
			{m.back()}
		</Button>
		<h2 class="text-lg font-bold sm:text-xl">{chapter?.title || m.chapter_fallback_title()}</h2>
		<Button
			variant="secondary"
			class="bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
			onclick={() => {
				// Stop playing when going back
				globalPlayer.stop();
				goto(resolve(`/books/${bookId}/chapters/${chapterId}/edit`));
			}}
		>
			{m.edit()}
		</Button>
	</div>
{/snippet}

<div class="min-h-full w-full bg-black text-white">
	{#if loading}
		<div class="flex h-full w-full items-center justify-center">
			<LoaderIcon class="h-8 w-8 animate-spin text-primary" />
		</div>
	{:else if error}
		<div class="flex h-full w-full items-center justify-center text-red-400">
			<p>{error}</p>
		</div>
	{:else if chapter}
		<ChapterView {chapter} titleSnippet={titleBar} class="h-full" useGlobalPlayer />
	{:else}
		<div class="flex h-full w-full items-center justify-center">
			<p>{m.chapter_not_found()}</p>
		</div>
	{/if}
</div>
