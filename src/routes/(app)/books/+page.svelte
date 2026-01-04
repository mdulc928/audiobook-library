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
	import PlayIcon from '$lib/designSystem/icons/PlayIcon.svelte';
	import { globalPlayer } from '$lib/app/concepts/Book/globalPlayer.svelte';
	import type { Chapter } from '$lib/app/concepts/Book/Book.svelte';

	let booksQuery = $state<BooksQueryState>();
	let genresQuery = $state<GenresQueryState>();

	// For Hero Section
	let featuredBook = $derived(
		booksQuery?.data && booksQuery.data.length > 0 ? booksQuery.data[0] : undefined
	);
	let coverUrl = $state<string | undefined>(undefined);

	onMount(async () => {
		genresQuery = await getGenres();
	});

	onMount(async () => {
		booksQuery = await getBooks();
	});

	$effect(() => {
		if (featuredBook) {
			featuredBook.getCoverUrl().then((url) => {
				if (url) coverUrl = url;
			});
		}
	});

	function playBook(bookId: string, chapters: Chapter[] = []) {
		console.log('Playing book:', bookId);
		console.log('Chapters:', chapters);
		if (chapters && chapters.length > 0 && chapters[0].audioSrc) {
			globalPlayer.playChapter(bookId, chapters[0]);
		} else {
			goto(resolve(`/books/${bookId}`));
		}
	}
</script>

<div class="flex min-h-full w-full flex-col bg-bg pb-24 text-fg">
	{#if booksQuery?.isPending || genresQuery?.isPending}
		<div class="flex h-screen items-center justify-center">
			<LoaderIcon class="h-8 w-8 animate-spin text-primary" />
		</div>
	{:else if booksQuery?.isError || genresQuery?.isError}
		<div class="flex h-screen w-full items-center justify-center text-error">
			<p>Failed to load books or genres.</p>
		</div>
	{:else if featuredBook}
		<!-- Hero Section -->
		<div class="relative h-[50vh] min-h-[400px] w-full shrink-0 overflow-hidden">
			<!-- Background Image -->
			<div class="absolute inset-0">
				{#if coverUrl}
					<img src={coverUrl} alt={featuredBook.title} class="h-full w-full object-cover" />
				{:else}
					<div class="h-full w-full bg-stone-800"></div>
				{/if}
				<div class="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-transparent"></div>
				<div
					class="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-transparent"
				></div>
			</div>

			<!-- Hero Content -->
			<div class="absolute bottom-0 left-0 w-full max-w-4xl p-8 md:p-16">
				<div class="space-y-4">
					<div
						class="inline-block rounded-full border border-primary/20 bg-primary/20 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md"
					>
						Featured Book
					</div>
					<h1 class="text-3xl leading-tight font-black text-white drop-shadow-lg md:text-5xl">
						{featuredBook.title}
					</h1>
					{#if featuredBook.author && featuredBook.author.length > 0}
						<p class="text-lg text-white/80">
							By {featuredBook.author.join(', ')}
						</p>
					{/if}

					<p class="line-clamp-2 max-w-xl text-base text-white/60 md:text-lg">
						{featuredBook.description || 'Start listening to this amazing book.'}
					</p>

					<div class="flex gap-4 pt-4">
						<Button
							variant="primary"
							class="h-10 rounded-full px-2 py-1 text-base font-bold shadow-lg shadow-primary/25 transition-transform hover:scale-105 md:h-12 md:px-8 md:text-lg"
							onclick={() => playBook(featuredBook!.id!, featuredBook!.chapters ?? [])}
						>
							<PlayIcon class="mr-2 h-5 w-5 fill-current" />
							Start Listening
						</Button>
						<Button
							variant="secondary"
							class="h-10 rounded-full bg-white/10 px-6 text-base font-bold text-white backdrop-blur-md hover:bg-white/20 md:h-12 md:px-8 md:text-lg"
							onclick={() => goto(resolve(`/books/${featuredBook!.id}`))}
						>
							More Info
						</Button>
					</div>
				</div>
			</div>
		</div>

		<!-- Library Content -->
		<div class="space-y-10 p-6 md:p-8">
			<div class="flex items-center justify-between">
				<Heading level={3}>Library</Heading>
				<Button size="small" onclick={() => goto(resolve('/books/create'))}>Create Book</Button>
			</div>

			<!-- Vertical Scroll for Genres -->
			<div class="scrollbar-hide flex flex-col gap-8">
				<!-- All Books Section -->
				<div class="flex flex-col gap-2">
					<div class="sticky top-0 z-10 bg-bg px-1 py-2">
						<Heading level={4}>All Books</Heading>
					</div>
					<!-- Horizontal Scroll Container -->
					<div
						class="scrollbar-hide -mx-4 flex snap-x snap-mandatory overflow-x-auto px-6 pb-4"
						style="touch-action: pan-x pan-y;"
					>
						<div class="flex gap-6">
							{#each booksQuery?.data ?? [] as book (book.id)}
								<div class="w-36 flex-none snap-start md:w-44">
									<BookCollapsedView {book} />
								</div>
							{/each}
						</div>
					</div>
				</div>

				{#if genresQuery?.data}
					{#each genresQuery.data as genre (genre.id)}
						{@const genreBooks = (booksQuery?.data ?? []).filter((b) =>
							b.genres?.includes(genre.id!)
						)}
						{#if genreBooks.length > 0}
							<div class="flex flex-col gap-2">
								<div class="sticky top-0 z-10 bg-bg px-1 py-2">
									<Heading level={4}>{genre.name}</Heading>
								</div>
								<!-- Horizontal Scroll Container -->
								<div
									class="scrollbar-hide -mx-4 flex snap-x snap-mandatory overflow-x-auto px-6 pb-4"
									style="touch-action: pan-x pan-y;"
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
			</div>
		</div>
	{:else}
		<div class="text-muted-foreground flex h-96 w-full flex-col items-center justify-center gap-4">
			<p>No books found.</p>
			<Button variant="secondary" onclick={() => goto(resolve('/books/create'))}>
				Create your first book
			</Button>
		</div>
	{/if}
</div>
