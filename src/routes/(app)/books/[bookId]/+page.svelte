<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getBook } from '$lib/app/api/books.svelte';
	import type { Book } from '$lib/app/concepts/Book/Book.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import PlayIcon from '$lib/designSystem/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/designSystem/icons/PauseIcon.svelte';
	import PlusIcon from '$lib/designSystem/icons/PlusIcon.svelte';
	import ArrowRightIcon from '$lib/designSystem/icons/ArrowRightIcon.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getGenres } from '$lib/app/api/genres.svelte';
	import { globalPlayer } from '$lib/app/concepts/Book/globalPlayer.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';

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
		<div class="flex h-full flex-col md:grid md:grid-cols-12 md:gap-0">
			<!-- Book Cover Section -->
			<!-- Fixed position relative to view -->
			<div
				class="relative h-[35vh] w-full shrink-0 overflow-hidden md:col-span-7 md:row-start-1 md:row-end-1 md:h-full"
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
								{#each genreNames as genre (genre)}
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
								onclick={() => {
									if (
										book?.id &&
										globalPlayer.currentBookId === book.id &&
										globalPlayer.currentChapterId
									) {
										// Resume current book
										if (globalPlayer.isPlaying) {
											globalPlayer.pause();
										} else {
											globalPlayer.play();
										}
									} else if (book?.chapters && book.chapters.length > 0) {
										// Play first chapter
										const first = book.chapters[0];
										if (first.audioSrc) {
											globalPlayer.playChapter(book.id!, first);
										}
									}
								}}
							>
								{#if book?.id && globalPlayer.currentBookId === book.id && globalPlayer.isPlaying}
									<PauseIcon class="mr-2 h-5 w-5 fill-current" />
									<span>Pause</span>
								{:else if book?.id && globalPlayer.currentBookId === book.id && globalPlayer.currentChapterId}
									<PlayIcon class="mr-2 h-5 w-5 fill-current" />
									<span>Resume</span>
								{:else}
									<PlayIcon class="mr-2 h-5 w-5 fill-current" />
									<span>Play</span>
								{/if}
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
				class="flex min-h-0 w-full flex-1 flex-col bg-bg p-4 md:col-span-5 md:row-start-1 md:row-end-1 md:h-full md:p-6 lg:p-8"
			>
				<div
					class="flex h-full flex-col overflow-hidden rounded-4xl bg-black/40 text-white shadow-xl ring-1 ring-white/10"
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
							onclick={() => goto(resolve(`/books/${book!.id}/chapters/new/edit`))}
						>
							<PlusIcon class="h-5 w-5" />
						</Button>
					</div>

					<!-- Scrollable List -->
					<div class="flex-1 overflow-y-auto p-4 md:p-6">
						<div class="space-y-3">
							{#each book.chapters || [] as chapter, i (chapter.id)}
								<div
									class="group flex items-center gap-4 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-md hover:ring-1 hover:ring-white/20"
								>
									<!-- Play Button -->
									<button
										class={cc(
											'hover:text-primary-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors',
											globalPlayer.isChapterPlaying(book!.id!, chapter.id!)
												? 'text-primary-foreground bg-primary'
												: 'bg-white/10 text-white hover:bg-primary'
										)}
										onclick={async (e) => {
											e.stopPropagation();
											if (globalPlayer.isChapterPlaying(book!.id!, chapter.id!)) {
												globalPlayer.pause();
											} else if (chapter.audioSrc) {
												globalPlayer.playChapter(book!.id!, chapter);
											}
										}}
										aria-label={globalPlayer.isChapterPlaying(book!.id!, chapter.id!)
											? 'Pause chapter'
											: 'Play chapter'}
									>
										{#if globalPlayer.isChapterPlaying(book!.id!, chapter.id!)}
											<PauseIcon class="h-5 w-5 fill-current" />
										{:else}
											<PlayIcon class="ml-1 h-5 w-5 fill-current" />
										{/if}
									</button>

									<!-- Content -->
									<div class="min-w-0 flex-1">
										<h3 class="truncate font-semibold text-white">
											{chapter.title || `Chapter ${i + 1}`}
										</h3>
										<div class="mt-1 flex items-center gap-2 text-xs text-white/60">
											{#if chapter.duration}
												<span>{formatDuration(chapter.duration)}</span>
												<span>•</span>
											{/if}
											<span>Ep. {i + 1}</span>
										</div>
									</div>

									<!-- Action (View) -->
									<button
										class="flex h-10 w-10 items-center justify-center rounded-full text-white/50 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10 hover:text-white focus:opacity-100"
										onclick={() => goto(resolve(`/books/${book!.id}/chapters/${chapter.id}`))}
										aria-label="View chapter"
									>
										<ArrowRightIcon class="h-5 w-5" />
									</button>
								</div>
							{:else}
								<div class="flex flex-col items-center justify-center py-12 text-center">
									<p class="text-lg font-medium text-white/70">No chapters yet</p>
									<p class="text-sm text-white/40">Add your first chapter to get started</p>
									<Button
										variant="primary"
										class="mt-6 shadow-lg shadow-primary/25 rounded-full px-6 flex items-center"
										onclick={() => goto(resolve(`/books/${book!.id}/chapters/new/edit`))}
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
