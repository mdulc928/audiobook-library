<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createBook, updateBook } from '$lib/app/api/books.svelte';
	import { getGenres } from '$lib/app/api/genres.svelte';
	import { Book, type BookImage } from '$lib/app/concepts/Book/Book.svelte';
	import { getAppStorage } from '$lib/app/firebase.client.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import CreatableSelect from '$lib/designSystem/components/CreatableSelect/CreatableSelect.svelte';
	import Input from '$lib/designSystem/components/Input/Input.svelte';

	import { toast } from '$lib/designSystem/components/Toast/toastManager.svelte';
	import ImageIcon from '$lib/designSystem/icons/ImageIcon.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import PlusIcon from '$lib/designSystem/icons/PlusIcon.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { ref, uploadBytes } from 'firebase/storage';
	import { onMount } from 'svelte';

	let { book = undefined }: { book?: Book } = $props();

	let title = $state(book?.title ?? '');
	let author = $state(book?.author?.[0] ?? ''); // Assuming single author input for now, but storing as array
	let genres = $state<string[]>(book?.genres ?? []);
	let tags = $state<string[]>(book?.tags ?? []);

	let coverFile = $state<File | null>(null);
	let coverPreview = $state<string | null>(null);
	let isSubmitting = $state(false);

	// Genres and Tags handling
	let availableGenres = $state<string[]>([]);
	let availableTags = $state<string[]>([]); // You might want to fetch existing tags too if you have an API for it

	onMount(async () => {
		const genresQuery = await getGenres();
		if (genresQuery.data) {
			availableGenres = genresQuery.data
				.map((g) => g.name)
				.filter((n): n is string => n !== undefined);
		}

		if (book) {
			// Initialize preview if editing and cover exists
			const url = await book.getCoverUrl();
			if (url) {
				coverPreview = url;
			}
		}
	});

	function handleCoverSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			coverFile = input.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				coverPreview = e.target?.result as string;
			};
			reader.readAsDataURL(coverFile);
		}
	}

	async function uploadCover(bookId: string) {
		if (!coverFile) return null;

		const storage = getAppStorage();
		if (!storage) return null; // Handle missing storage
		const fileExtension = coverFile.name.split('.').pop();
		const storagePath = `books/${bookId}/cover.${fileExtension}`;
		const storageRef = ref(storage, storagePath);

		await uploadBytes(storageRef, coverFile);

		return storagePath;
	}

	async function handleSubmit() {
		if (!title || !author) {
			toast.error({ title: 'Please fill in title and author' });
			return;
		}

		isSubmitting = true;

		try {
			// If editing, use existing book ID, otherwise generate new one (handled by Book constructor)
			const tempBook = book ?? new Book({ title: '', author: [] });
			const bookId = tempBook.id; // Correct ID usage

			// Upload cover if a new file is selected
			let coverPath = book?.cover?.imageLink;
			if (coverFile) {
				const uploadedPath = await uploadCover(bookId!);
				if (uploadedPath) coverPath = uploadedPath;
			}

			const bookData = new Book({
				id: bookId,
				title,
				author: [author],
				genres,
				tags,
				cover: {
					imageLink: coverPath
				}
			});

			if (book) {
				await updateBook(bookData);
				toast.success({ title: 'Book updated successfully' });
			} else {
				await createBook(bookData);
				toast.success({ title: 'Book created successfully' });
			}

			isSubmitting = false;
			setTimeout(() => {
				goto(resolve('/books'));
			}, 1500);
		} catch (error) {
			console.error('Error saving book:', error);
			toast.error({ title: `Failed to ${book ? 'update' : 'create'} book` });
			isSubmitting = false;
		}
	}
</script>

<div class="h-full w-full overflow-y-auto bg-bg p-4 md:p-8">
	<div class="mx-auto flex h-full max-w-7xl flex-col gap-6 md:flex-row md:gap-10">
		<!-- Cover Image Section (Majority of screen on Desktop) -->
		<div class="flex shrink-0 flex-col gap-4 md:w-2/3 xl:w-3/4">
			<div class="relative flex h-full w-full flex-col justify-center">
				<label
					class={cc(
						'group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300',
						'bg-card border-border shadow-sm hover:border-primary hover:bg-primary/5',
						coverPreview ? 'border-solid' : ''
					)}
				>
					<input type="file" accept="image/*" class="hidden" onchange={handleCoverSelect} />

					{#if coverPreview}
						<img
							src={coverPreview}
							alt="Cover preview"
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						>
							<span class="font-medium text-white">Change Cover</span>
						</div>
					{:else}
						<div
							class="text-muted-foreground flex flex-col items-center gap-4 transition-colors group-hover:text-primary"
						>
							<!-- Image Icon -->
							<div class="rounded-full bg-secondary/20 p-6">
								<ImageIcon class="h-12 w-12" />
							</div>
							<div class="flex items-center gap-2 text-lg font-medium">
								<PlusIcon class="h-5 w-5" />
								<span>Upload Cover</span>
							</div>
						</div>
					{/if}
				</label>
			</div>
		</div>

		<!-- Details Side Column -->
		<div class="flex flex-col gap-6 md:w-1/3 xl:w-1/4">
			<div class="bg-card rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
				<h2 class="mb-6 text-2xl font-bold tracking-tight">Book Details</h2>

				<div class="flex flex-col gap-5">
					<div class="space-y-2">
						<label
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							for="title">Title</label
						>
						<Input
							id="title"
							type="text"
							placeholder="Enter book title"
							bind:value={title}
							class="rounded-xl border-none bg-secondary/10 transition-colors hover:bg-secondary/20 focus:ring-2 focus:ring-primary/20"
						/>
					</div>

					<div class="space-y-2">
						<label
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							for="author">Author</label
						>
						<Input
							id="author"
							type="text"
							placeholder="Enter author name"
							bind:value={author}
							class="rounded-xl border-none bg-secondary/10 transition-colors hover:bg-secondary/20 focus:ring-2 focus:ring-primary/20"
						/>
					</div>

					<div class="space-y-2">
						<span
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>Genre</span
						>
						<!-- Using CreatableSelect for Genre (Single select for now, but passed as array) -->
						<CreatableSelect
							class="rounded-xl border-none bg-secondary/10 transition-colors hover:bg-secondary/20 focus:ring-2 focus:ring-primary/20"
							placeholder="Select Genre"
							bind:options={availableGenres}
							bind:value={genres}
							multiple={true}
							onCreate={(val) => {
								if (!availableGenres.includes(val)) availableGenres.push(val);
							}}
						/>
						<p class="text-muted-foreground text-[0.8rem]">Select one or more genres.</p>
					</div>

					<div class="space-y-2">
						<span
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>Tags</span
						>
						<CreatableSelect
							class="rounded-xl border-none bg-secondary/10 transition-colors hover:bg-secondary/20 focus:ring-2 focus:ring-primary/20"
							placeholder="Add Tags"
							bind:options={availableTags}
							bind:value={tags}
							multiple={true}
							onCreate={(val) => {
								if (!availableTags.includes(val)) availableTags.push(val);
							}}
						/>
					</div>
				</div>

				<div class="mt-8">
					<Button
						class="w-full max-w-[200px] rounded-full text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/40"
						onclick={handleSubmit}
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<LoaderIcon class="mr-2 h-5 w-5 animate-spin" />
							Saving...
						{:else}
							<span>{book ? 'Update Book' : 'Create Book'}</span>
						{/if}
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
