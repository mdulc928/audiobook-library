<script lang="ts">
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { getBook } from '$lib/app/api/books.svelte';
	import type { Book } from '$lib/app/concepts/Book/Book.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import PlayIcon from '$lib/designSystem/icons/PlayIcon.svelte';
	import PlusIcon from '$lib/designSystem/icons/PlusIcon.svelte';
	import ArrowRightIcon from '$lib/designSystem/icons/ArrowRightIcon.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { getGenres } from '$lib/app/api/genres.svelte';

	let book = $state<Book>();
	let loading = $state(true);
	let error = $state<string>();
	let coverUrl = $state<string | null>(null);
	let genreNames = $state<string[]>([]);

	onMount(async () => {
		try {
			const bookId = page.params.bookId;
			if (bookId) {
				const [fetchedBook, genresQuery] = await Promise.all([getBook(bookId), getGenres()]);

				book = fetchedBook;
				if (book) {
					coverUrl = await book.getCoverUrl();

					// Map genre IDs to names
					if (book.genres && genresQuery.data) {
						genreNames = book.genres
							.map((id) => {
								const match = genresQuery.data?.find((g) => g.id === id);
								return match ? match.name : id;
							})
							.filter((n): n is string => n !== undefined);
					}
				}
			} else {
				error = 'No book ID provided';
			}
		} catch (e) {
			console.error(e);
			error = 'Failed to load book';
		} finally {
			loading = false;
		}
	});

	function formatDuration(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}
</script>

<div class="h-full w-full overflow-hidden bg-bg text-fg">
	{#if loading}
		<div class="flex h-full w-full items-center justify-center">
			<LoaderIcon class="h-8 w-8 animate-spin text-primary" />
		</div>
	{:else if error}
		<div class="flex h-full w-full items-center justify-center text-error">
			<p>{error}</p>
		</div>
	{:else if book}
		<div class="grid-row-1 grid h-full grid-cols-1 gap-0 md:grid-cols-12">
			<!-- Book Cover Section -->
			<!-- Fixed position relative to view -->
			<div
				class="relative row-start-1 row-end-1 h-[40vh] w-full overflow-hidden md:col-span-7 md:h-full"
			>
				{#if coverUrl}
					<div class="absolute inset-0 h-full w-full">
						<img src={coverUrl} alt={book.title} class="h-full w-full object-cover" />
						<!-- Gradient Overlay -->
						<div
							class="absolute inset-0 bg-linear-to-t from-bg via-bg/60 to-transparent md:bg-linear-to-r md:from-transparent md:via-bg/40 md:via-60% md:to-bg"
						></div>
						<div
							class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-80"
						></div>
					</div>
				{:else}
					<div class="flex h-full w-full items-center justify-center bg-secondary/20">
						<p class="text-muted-foreground">No Cover</p>
					</div>
				{/if}

				<!-- Book Details Overlay -->
				<div class="absolute bottom-0 left-0 w-full p-6 md:p-12">
					<div class="max-w-xl space-y-4">
						{#if genreNames.length > 0}
							<div class="flex flex-wrap gap-2">
								{#each genreNames as genre}
									<span
										class="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md"
									>
										{genre}
									</span>
								{/each}
							</div>
						{/if}

						<h1 class="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
							{book.title}
						</h1>

						{#if book.author && book.author.length > 0}
							<p class="text-lg text-white/80 md:text-xl">
								{book.author[0]}
							</p>
						{/if}

						<div class="flex flex-wrap gap-4 pt-4">
							<Button
								variant="primary"
								class="flex h-12 w-auto min-w-[140px] items-center justify-center rounded-full bg-white px-8 text-base font-bold text-black shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-white/90"
							>
								<PlayIcon class="mr-2 h-5 w-5 fill-current" />
								<span>Play</span>
							</Button>
							<!-- Edit button -->
							<Button
								variant="secondary"
								class="flex h-12 w-auto min-w-[140px] items-center justify-center rounded-full border border-white/20 bg-black/20 px-8 text-base font-semibold text-white backdrop-blur-md transition-transform hover:scale-105 hover:bg-black/40"
								onclick={() => goto(resolve(`/books/${book!.id}/edit`))}
							>
								Edit Details
							</Button>
						</div>
					</div>
				</div>
			</div>

			<!-- Chapters List Section -->
			<!-- Modular container design -->
			<div
				class="row-start-1 row-end-1 flex h-full min-h-0 w-full flex-col bg-gray-900 p-4 md:col-span-5 md:p-6 lg:p-8"
			>
				<div
					class="bg-card flex h-full flex-col overflow-hidden rounded-4xl bg-bg text-fg shadow-xl ring-1 ring-white/5"
				>
					<div class="flex items-center justify-between border-b border-border/40 p-6 md:p-8">
						<div>
							<h2 class="text-2xl font-bold">Episodes</h2>
							<p class="text-muted-foreground text-sm">
								{book.chapters?.length ?? 0} chapters
							</p>
						</div>
						<Button
							variant="secondary"
							class="hover:text-primary-foreground h-10 w-10 rounded-full p-0 shadow-sm hover:bg-primary"
							onclick={() => goto(resolve(`/books/${book!.id}/chapters/new`))}
						>
							<PlusIcon class="h-5 w-5" />
						</Button>
					</div>

					<!-- Scrollable List -->
					<div class="flex-1 overflow-y-auto p-4 md:p-6">
						<div class="space-y-3">
							{#each book.chapters || [] as chapter, i}
								<div
									class="group flex items-center gap-4 rounded-xl bg-secondary/30 p-4 transition-all hover:bg-secondary/50 hover:shadow-md hover:ring-1 hover:ring-primary/20"
								>
									<!-- Play Button -->
									<button
										class="group-hover:text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background shadow-sm transition-colors group-hover:bg-primary"
									>
										<PlayIcon class="ml-1 h-5 w-5" />
									</button>

									<!-- Content -->
									<div class="min-w-0 flex-1">
										<h3 class="truncate font-semibold text-foreground">
											{chapter.title || `Chapter ${i + 1}`}
										</h3>
										<div class="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
											{#if chapter.duration}
												<span>{formatDuration(chapter.duration)}</span>
												<span>•</span>
											{/if}
											<span>Ep. {i + 1}</span>
										</div>
									</div>

									<!-- Action (Edit) -->
									<button
										class="text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100 hover:bg-background hover:text-foreground hover:shadow-sm focus:opacity-100"
										onclick={() => goto(resolve(`/books/${book!.id}/chapters/${chapter.id}`))}
										aria-label="Edit chapter"
									>
										<ArrowRightIcon class="h-5 w-5" />
									</button>
								</div>
							{:else}
								<div class="flex flex-col items-center justify-center py-12 text-center">
									<p class="text-lg font-medium text-muted-foreground">No chapters yet</p>
									<p class="text-sm text-muted-foreground/60">
										Add your first chapter to get started
									</p>
									<Button
										variant="primary"
										class="mt-6 shadow-lg shadow-primary/25 rounded-full px-6 flex items-center"
										onclick={() => goto(resolve(`/books/${book!.id}/chapters/new`))}
									>
										<PlusIcon class="mr-2 h-4 w-4" />
										Create Chapter
									</Button>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
