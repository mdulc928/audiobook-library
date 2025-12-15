<script lang="ts">
	import { Book, Chapter, BookImage } from '$lib/app/concepts/Book/Book.svelte';
	import Input from '$lib/designSystem/components/Input/Input.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import Heading from '$lib/designSystem/components/Heading/Heading.svelte';
	import { getAppStorage } from '$lib/app/firebase.client.svelte';
	import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
	import { createBook } from '$lib/app/apiFetch.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/designSystem/components/Toast/toastFunctions.svelte';

	let title = $state('');
	let author = $state('');
	let coverFile: File | undefined = $state();
	let chapters: { title: string; audioFile: File | undefined }[] = $state([
		{ title: '', audioFile: undefined }
	]);
	let isSubmitting = $state(false);

	function addChapter() {
		chapters.push({ title: '', audioFile: undefined });
	}

	function removeChapter(index: number) {
		chapters = chapters.filter((_, i) => i !== index);
	}

	async function handleSubmit() {
		if (!title || !author || !coverFile || chapters.some((c) => !c.title || !c.audioFile)) {
			toast.error({ title: 'Please fill in all fields' });
			return;
		}

		isSubmitting = true;
		const storage = getAppStorage();
		if (!storage) {
			console.error('Firebase Storage not initialized');
			isSubmitting = false;
			return;
		}

		try {
			// Upload cover
			const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
			await uploadBytes(coverRef, coverFile);
			const coverUrl = await getDownloadURL(coverRef);

			// Upload chapters
			const uploadedChapters = await Promise.all(
				chapters.map(async (chapter, index) => {
					if (!chapter.audioFile) throw new Error('Audio file missing');
					const audioRef = ref(
						storage,
						`chapters/${Date.now()}_${index}_${chapter.audioFile.name}`
					);
					await uploadBytes(audioRef, chapter.audioFile);
					const audioUrl = await getDownloadURL(audioRef);

					// Get duration (mock for now, ideally get from file metadata or audio element)
					const duration = 0;

					return new Chapter({
						title: chapter.title,
						audioSrc: audioUrl,
						duration: duration,
						images: [],
						subtitles: []
					});
				})
			);

			const newBook = new Book({
				title,
				author: author.split(',').map((a) => a.trim()),
				cover: new BookImage({ imageLink: coverUrl }),
				chapters: uploadedChapters
			});

			await createBook(newBook);
			toast.success({ title: 'Book created successfully' });
			goto('/books');
		} catch (error) {
			console.error('Error creating book:', error);
			toast.error({ title: 'Failed to create book' });
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl py-8">
	<Heading>Create New Book</Heading>

	<div class="mt-6 flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<label for="title" class="text-sm font-medium">Title</label>
			<Input id="title" bind:value={title} placeholder="Book Title" />
		</div>

		<div class="flex flex-col gap-2">
			<label for="author" class="text-sm font-medium">Author (comma separated)</label>
			<Input id="author" bind:value={author} placeholder="Author Name" />
		</div>

		<div class="flex flex-col gap-2">
			<label for="cover" class="text-sm font-medium">Cover Image</label>
			<Input
				id="cover"
				type="file"
				accept="image/*"
				onchange={(e) => (coverFile = e.currentTarget.files?.[0])}
			/>
		</div>

		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Chapters</h3>
				<Button variant="secondary" size="small" onclick={addChapter}>Add Chapter</Button>
			</div>

			{#each chapters as chapter, i}
				<div class="flex flex-col gap-2 rounded-md border p-4">
					<div class="flex items-center justify-between">
						<span class="font-medium">Chapter {i + 1}</span>
						{#if chapters.length > 1}
							<Button
								variant="tertiary"
								size="small"
								class="text-red-500"
								onclick={() => removeChapter(i)}>Remove</Button
							>
						{/if}
					</div>
					<Input bind:value={chapter.title} placeholder="Chapter Title" />
					<Input
						type="file"
						accept="audio/*"
						onchange={(e) => (chapter.audioFile = e.currentTarget.files?.[0])}
					/>
				</div>
			{/each}
		</div>

		<Button onclick={handleSubmit} disabled={isSubmitting}>
			{isSubmitting ? 'Creating...' : 'Create Book'}
		</Button>
	</div>
</div>
