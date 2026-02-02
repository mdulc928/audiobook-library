<script lang="ts">
	import { Book, BookImage } from '$lib/app/concepts/Book/Book.svelte';
	import Input from '$lib/designSystem/components/Input/Input.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import CreatableSelect from '$lib/designSystem/components/CreatableSelect/CreatableSelect.svelte';
	import { getAppStorage } from '$lib/app/firebase.client.svelte';
	import { ref, uploadBytes } from 'firebase/storage';
	import { createBook } from '$lib/app/api/books.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { toast } from '$lib/designSystem/components/Toast/toastManager.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import ImageIcon from '$lib/designSystem/icons/ImageIcon.svelte';
	import PlusIcon from '$lib/designSystem/icons/PlusIcon.svelte';
	import LoaderIcon from '$lib/designSystem/icons/LoaderIcon.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let title = $state('');
	let author = $state('');
	let genres: string[] = $state([]);
	let tags: string[] = $state([]);
	let coverFile: File | undefined = $state();
	let coverPreview: string | undefined = $state();
	let isSubmitting = $state(false);

	// Mock options for now - in a real app these would come from the backend
	let availableGenres = $state(['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Non-Fiction']);
	// let availableTags = $state(['Bestseller', 'New Release', 'Classic', 'Indie']);

	function handleCoverSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			coverFile = input.files[0];
			coverPreview = URL.createObjectURL(coverFile);
		}
	}

	async function handleSubmit() {
		if (!title || !author || !coverFile) {
			toast.error({ title: m.fill_required_fields() });
			return;
		}

		isSubmitting = true;
		const storage = getAppStorage();
		if (!storage) {
			console.error('Firebase Storage not initialized');
			toast.error({ title: m.system_error_storage() });
			isSubmitting = false;
			return;
		}

		try {
			// Generate a generic ID for the book to use in path (or let backend do it, but we need path now)
			// Since Book class generates ID in constructor if not provided, we can instantiate it first partially
			// or just use a timestamp based ID for the folder like the previous code did.
			// The user requirement says: "books/{book_id}/cover.{ext}".
			// We need a book_id. Let's generate one.
			const tempId = crypto.randomUUID();

			const ext = coverFile.name.split('.').pop();
			const coverPath = `books/${tempId}/cover.${ext}`;
			const coverRef = ref(storage, coverPath);
			await uploadBytes(coverRef, coverFile);

			const newBook = new Book({
				id: tempId,
				title,
				author: author.split(',').map((a) => a.trim()),
				cover: new BookImage({ imageLink: coverPath }),
				genres,
				tags,
				chapters: [] // No chapters for this step
			});

			await createBook(newBook);
			toast.success({ title: m.book_created_success() });
			isSubmitting = false;
			setTimeout(() => {
				goto(resolve('/books'));
			}, 1500);
		} catch (error) {
			console.error('Error creating book:', error);
			toast.error({ title: m.book_action_failed({ action: m.create() }) });
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="mx-auto min-h-full w-full max-w-3xl overflow-auto bg-bg p-4 md:p-8">
	<div class="mx-auto flex max-w-7xl flex-col gap-6 pb-4 md:flex-row md:gap-10">
		<!-- Cover Image Section (Majority of screen on Desktop) -->
		<div class="flex shrink-0 flex-col gap-4 md:w-2/3 xl:w-3/4">
			<div class="relative flex h-full w-full flex-col justify-center">
				<label
					class={cc(
						'group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300',
						'border-border bg-card shadow-sm hover:border-primary hover:bg-primary/5',
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
							<span class="font-medium text-white">{m.change_cover()}</span>
						</div>
					{:else}
						<div
							class="flex flex-col items-center gap-4 text-muted-foreground transition-colors group-hover:text-primary"
						>
							<!-- Image Icon -->
							<div class="rounded-full bg-secondary/20 p-6">
								<ImageIcon class="h-12 w-12" />
							</div>
							<div class="flex items-center gap-2 text-lg font-medium">
								<PlusIcon class="h-5 w-5" />
								<span>{m.upload_cover()}</span>
							</div>
						</div>
					{/if}
				</label>
			</div>
		</div>

		<!-- Details Side Column -->
		<div class="flex flex-col gap-6 md:w-1/3 xl:w-1/4">
			<div class="rounded-3xl bg-card p-3 shadow-2xl backdrop-blur-sm">
				<h2 class="mb-6 text-2xl font-bold tracking-tight">{m.book_details()}</h2>

				<div class="flex flex-col gap-5">
					<div class="space-y-2">
						<label
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							for="title">{m.title_label()}</label
						>
						<Input
							id="title"
							type="text"
							placeholder={m.enter_book_title()}
							bind:value={title}
							class="rounded-xl border-none bg-secondary/10 transition-colors hover:bg-secondary/20 focus:ring-2 focus:ring-primary/20"
						/>
					</div>

					<div class="space-y-2">
						<label
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							for="author">{m.author_label()}</label
						>
						<Input
							id="author"
							type="text"
							placeholder={m.enter_author_name()}
							bind:value={author}
							class="rounded-xl border-none bg-secondary/10 transition-colors hover:bg-secondary/20 focus:ring-2 focus:ring-primary/20"
						/>
					</div>

					<div class="space-y-2">
						<span
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>{m.genre_label()}</span
						>
						<!-- Using CreatableSelect for Genre (Single select for now, but passed as array) -->
						<CreatableSelect
							class="rounded-xl border-none bg-secondary/10 transition-colors hover:bg-secondary/20 focus:ring-2 focus:ring-primary/20"
							placeholder={m.select_genre()}
							bind:options={availableGenres}
							bind:value={genres}
							multiple={true}
							onCreate={(val) => {
								if (!availableGenres.includes(val)) availableGenres.push(val);
							}}
						/>
						<p class="text-[0.8rem] text-muted-foreground">{m.select_genre_help()}</p>
					</div>
					<!--
					<div class="space-y-2">
						<span
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>{m.tags_label()}</span
						>
						<CreatableSelect
							class="rounded-xl border-none bg-secondary/10 transition-colors hover:bg-secondary/20 focus:ring-2 focus:ring-primary/20"
							placeholder={m.add_tags()}
							bind:options={availableTags}
							bind:value={tags}
							multiple={true}
							onCreate={(val) => {
								if (!availableTags.includes(val)) availableTags.push(val);
							}}
						/>
					</div>
				-->
				</div>

				<div class="mt-8">
					<Button
						class="w-full max-w-[200px] rounded-full text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/40"
						onclick={handleSubmit}
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<LoaderIcon class="mr-2 h-5 w-5" />
							{m.creating()}
						{:else}
							{m.create_book()}
						{/if}
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>
