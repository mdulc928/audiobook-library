<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { updateBook } from '$lib/app/api/books.svelte';
	import { Book, Chapter, BookImage, Subtitle } from '$lib/app/concepts/Book/Book.svelte';
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import Input from '$lib/designSystem/components/Input/Input.svelte';
	import { toast } from '$lib/designSystem/components/Toast/toastManager.svelte';

	import ChevronDownIcon from '$lib/designSystem/icons/ChevronDownIcon.svelte';
	import PlayIcon from '$lib/designSystem/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/designSystem/icons/PauseIcon.svelte';
	import PlusIcon from '$lib/designSystem/icons/PlusIcon.svelte';

	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import ChapterProgressView from './ChapterProgressView.svelte';
	import TimeView from './TimeView.svelte';
	import ChapterView from './ChapterView.svelte';
	import {
		uploadChapterImage,
		uploadChapterAudio,
		openFilePicker,
		resolveImageUrl,
		calculateNextStartTime
	} from './chapterEditorHelpers';

	let { book, chapterId }: { book: Book; chapterId: string } = $props();

	// State
	let chapter = $state<Chapter | undefined>(undefined);
	let title = $state('');
	let isSubmitting = $state(false);
	let audioFile = $state<File | null>(null);

	// Editor Mode
	let activeTab = $state<'images' | 'subtitles'>('images');

	// Image Editor State
	let selectedImageIndex = $state(0);
	// Track files pending upload (Key: the BookImage instance, Value: the File)
	const visualFiles = new SvelteMap<BookImage, File>();

	let currentImage = $derived(chapter?.images[selectedImageIndex]);
	const isNewImage = $derived(chapter ? selectedImageIndex === chapter.images.length : false);

	// Resolve current image URL (handles blob URLs and storage paths)
	const imageUrlCache = new Map<string, string>();
	let currentImageUrl = $state<string | undefined>(undefined);

	$effect(() => {
		const imageLink = currentImage?.imageLink;
		resolveImageUrl(imageLink, imageUrlCache).then((url) => {
			currentImageUrl = url;
		});
	});

	// Subtitle Editor State
	let selectedSubtitleIndex = $state(0);
	let currentSubtitle = $derived(chapter?.subtitles[selectedSubtitleIndex]);
	const isNewSubtitle = $derived(
		chapter ? selectedSubtitleIndex === (chapter.subtitles?.length ?? 0) : false
	);

	// Preview Mode State
	let isPreviewing = $state(false);

	onMount(() => {
		if (chapterId === 'new') {
			chapter = new Chapter({
				id: crypto.randomUUID(),
				title: '',
				duration: 0,
				audioSrc: '',
				images: [], // Ensure initialized
				subtitles: [] // Ensure initialized
			});
		} else {
			// ... (existing helper logic)
			const existing = book.chapters?.find((c) => c.id === chapterId);
			if (existing) {
				chapter = existing;
				title = chapter.title || '';
				// Ensure arrays exist
				if (!chapter.images) chapter.images = [];
				if (!chapter.subtitles) chapter.subtitles = [];
			} else {
				toast.error({ title: 'Chapter not found' });
				goto(resolve(`/books/${book.id}`));
			}
		}
	});

	async function handleImageSelect() {
		const file = await openFilePicker('image/*');
		if (!file || !chapter) return;

		const blobUrl = URL.createObjectURL(file);

		if (isNewImage) {
			const startTime = calculateNextStartTime(chapter.images);
			const newImage = new BookImage({
				imageLink: blobUrl,
				timestamp: startTime,
				duration: 5
			});
			chapter.images.push(newImage);
			visualFiles.set(newImage, file);
		} else if (currentImage) {
			currentImage.imageLink = blobUrl;
			visualFiles.set(currentImage, file);
		}
		toast.success({ title: 'Image selected' });
	}

	function createSubtitle() {
		if (!chapter) return;
		const startTime = calculateNextStartTime(chapter.subtitles);
		const newSub = new Subtitle({
			text: '',
			timestamp: startTime,
			duration: 5
		});
		chapter.subtitles.push(newSub);
	}

	// Generic Navigation
	function nextItem() {
		if (!chapter) return;
		if (activeTab === 'images') {
			if (selectedImageIndex < chapter.images.length) selectedImageIndex++;
		} else {
			if (selectedSubtitleIndex < (chapter.subtitles?.length ?? 0)) selectedSubtitleIndex++;
		}
	}

	function prevItem() {
		if (activeTab === 'images') {
			if (selectedImageIndex > 0) selectedImageIndex--;
		} else {
			if (selectedSubtitleIndex > 0) selectedSubtitleIndex--;
		}
	}

	function deleteCurrentItem() {
		if (!chapter) return;
		if (activeTab === 'images') {
			if (isNewImage) return;
			const img = chapter.images[selectedImageIndex];
			visualFiles.delete(img);
			chapter.images.splice(selectedImageIndex, 1);
			if (selectedImageIndex > 0) selectedImageIndex--;
		} else {
			if (isNewSubtitle) return;
			chapter.subtitles.splice(selectedSubtitleIndex, 1);
			if (selectedSubtitleIndex > 0) selectedSubtitleIndex--;
		}
	}

	// Derived helpers for UI
	let { currentItem, isNewItem, currentIndex, totalItems } = $derived.by(() => {
		if (activeTab === 'images') {
			return {
				currentItem: currentImage,
				isNewItem: isNewImage,
				currentIndex: selectedImageIndex,
				totalItems: chapter?.images?.length ?? 0
			};
		}
		return {
			currentItem: currentSubtitle,
			isNewItem: isNewSubtitle,
			currentIndex: selectedSubtitleIndex,
			totalItems: chapter?.subtitles?.length ?? 0
		};
	});

	async function handleAudioSelect() {
		const file = await openFilePicker('audio/*');
		if (!file) return;

		audioFile = file;
		const blobUrl = URL.createObjectURL(file);
		const ext = file.name.split('.').pop()?.toLowerCase();
		chapter?.player.setSrc(blobUrl, ext ? [ext] : undefined);
		toast.success({ title: 'Audio selected (Save to upload)' });
	}

	function togglePlay() {
		if (!chapter?.player) return;
		if (chapter.player.status === 'playing') {
			chapter.player.pause();
		} else {
			chapter.player.play();
		}
	}

	async function handleSave() {
		if (!chapter) return;
		isSubmitting = true;

		try {
			chapter.title = title;

			if (audioFile) {
				const audioPath = await uploadChapterAudio(book.id!, chapter.id!, audioFile);
				if (audioPath) {
					chapter.audioSrc = audioPath;
					chapter.player.setSrc(audioPath);
				}
			}

			if (chapter.images) {
				for (const img of chapter.images) {
					const file = visualFiles.get(img);
					if (file) {
						const imagePath = await uploadChapterImage(book.id!, chapter.id!, file);
						if (imagePath) img.imageLink = imagePath;
						visualFiles.delete(img);
					}
				}
			}

			// Clean up subtitles (filter out empty ones if strictly needed, or just save all)
			// No upload needed for subtitles

			if (chapterId === 'new') {
				if (!book.chapters) book.chapters = [];
				const exists = book.chapters.find((c) => c.id === chapter!.id);
				if (!exists) book.chapters.push(chapter);
			}

			await updateBook(book);
			toast.success({ title: 'Chapter saved successfully' });

			if (chapterId === 'new') {
				goto(resolve(`/books/${book.id}/chapters/${chapter.id}/edit`));
			}
		} catch (e) {
			console.error('Failed to save chapter', e);
			toast.error({ title: 'Failed to save chapter' });
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if chapter}
	{#snippet topBar()}
		<div class="flex w-full flex-wrap items-center justify-between gap-2 p-2 sm:p-4">
			<Button
				variant="secondary"
				class="bg-black/20 text-sm text-white backdrop-blur-md sm:text-base"
				onclick={() => goto(resolve(`/books/${book.id}`))}>Back</Button
			>
			<div class="max-w-[300px] min-w-[120px] flex-1">
				<Input
					bind:value={title}
					placeholder="Chapter Title"
					class="border-none bg-transparent text-center text-base font-bold text-white placeholder:text-white/50 focus:ring-0 sm:text-lg"
				/>
			</div>
			<div class="flex gap-2">
				<Button
					variant="secondary"
					class="border-transparent bg-white/10 text-sm text-white backdrop-blur-md hover:bg-white/20 sm:text-base"
					onclick={() => (isPreviewing = !isPreviewing)}
				>
					{isPreviewing ? 'Edit' : 'Preview'}
				</Button>
				<Button
					variant="primary"
					onclick={handleSave}
					disabled={isSubmitting}
					class="text-sm sm:text-base"
				>
					{isSubmitting ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</div>
	{/snippet}

	{#if isPreviewing}
		<!-- Preview Mode - Full ChapterView with custom title bar -->
		<ChapterView {chapter} titleSnippet={topBar} class="h-full" />
	{:else}
		<!-- Edit Mode -->
		<div class="relative flex h-full flex-col overflow-hidden bg-[#2A2A2A] text-white">
			<!-- Top Bar (rendered inline for edit mode) -->
			<div class="absolute top-0 left-0 z-10 w-full">
				{@render topBar()}
			</div>

			<!-- Main Visual Editor Area -->
			<div
				class="mt-16 flex flex-1 flex-col items-center justify-center gap-4 p-4 sm:mt-20 sm:gap-8 sm:p-8"
			>
				<!-- Tabs -->
				<div class="flex rounded-full bg-black/30 p-1">
					<button
						class={cc(
							'rounded-full px-4 py-2 text-xs font-bold transition-all sm:px-6 sm:text-sm',
							activeTab === 'images' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
						)}
						onclick={() => (activeTab = 'images')}
					>
						Images ({chapter.images?.length ?? 0})
					</button>
					<button
						class={cc(
							'rounded-full px-4 py-2 text-xs font-bold transition-all sm:px-6 sm:text-sm',
							activeTab === 'subtitles' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
						)}
						onclick={() => (activeTab = 'subtitles')}
					>
						Subtitles ({chapter.subtitles?.length ?? 0})
					</button>
				</div>

				<!-- Navigation & Card Container -->
				<div class="flex w-full max-w-4xl items-center justify-center gap-2 sm:gap-8">
					<!-- Left Arrow -->
					<button
						class="rounded-xl p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent sm:p-4"
						onclick={prevItem}
						disabled={currentIndex === 0}
					>
						<ChevronDownIcon class="h-8 w-8 rotate-90 sm:h-12 sm:w-12" />
					</button>

					<!-- Central Card -->
					{#if activeTab === 'images'}
						<div
							class="group relative flex h-[150px] w-[200px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg bg-white shadow-2xl transition-transform hover:scale-105 sm:h-[200px] sm:w-[300px] md:h-[250px] md:w-[400px]"
							onclick={handleImageSelect}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && handleImageSelect()}
						>
							{#if currentImageUrl}
								<img src={currentImageUrl} alt="Visual" class="h-full w-full object-contain" />
							{:else}
								<div class="flex flex-col items-center gap-4 text-black/80">
									<PlusIcon class="h-16 w-16" />
									<span class="text-lg font-bold text-[#8B6E4A]">
										{isNewImage ? 'Add Image' : 'Select Image'}
									</span>
								</div>
							{/if}
							<div
								class="absolute inset-0 flex items-center justify-center bg-black/40 font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
							>
								{isNewImage ? 'Add Image' : 'Change Image'}
							</div>
						</div>
					{:else}
						<!-- Subtitle Card -->
						<div
							class="group relative flex h-[150px] w-[200px] flex-col items-center justify-center rounded-lg bg-white p-4 shadow-2xl transition-transform hover:scale-105 sm:h-[200px] sm:w-[300px] sm:p-6 md:h-[250px] md:w-[400px]"
							onclick={() => {
								if (isNewSubtitle) createSubtitle();
							}}
							role="button"
							tabindex="0"
							onkeydown={(e) => {
								if (e.key === 'Enter' && isNewSubtitle) createSubtitle();
							}}
						>
							{#if !isNewSubtitle && currentSubtitle}
								<textarea
									bind:value={currentSubtitle.text}
									class="h-full w-full resize-none border-none bg-transparent text-center text-base font-medium text-black placeholder:text-black/40 focus:ring-0 sm:text-xl"
									placeholder="Enter subtitle text..."
								></textarea>
							{:else}
								<div class="flex cursor-pointer flex-col items-center gap-4 text-black/80">
									<PlusIcon class="h-16 w-16" />
									<span class="text-lg font-bold text-[#8B6E4A]">Add Subtitle</span>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Right Arrow -->
					<button
						class="rounded-xl p-2 text-white/30 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent sm:p-4"
						onclick={nextItem}
						disabled={isNewItem}
					>
						<ChevronDownIcon class="h-8 w-8 -rotate-90 sm:h-12 sm:w-12" />
					</button>
				</div>

				<!-- Page Indicator -->
				<div class="-mt-4 text-sm text-white/50">
					{currentIndex + 1} / {totalItems + 1}
				</div>

				<!-- Inputs Row -->
				<div
					class="flex min-h-[50px] flex-wrap justify-center gap-3 text-sm font-bold sm:gap-12 sm:text-lg"
				>
					{#if currentItem && !isNewItem}
						<div class="flex items-center gap-2">
							<span>Start:</span>
							<Input
								type="number"
								bind:value={currentItem.timestamp}
								class="w-24 border-white/20 bg-white/10 text-center text-white"
								step="0.1"
							/>
						</div>
						<div class="flex items-center gap-2">
							<span>Duration:</span>
							<Input
								type="number"
								bind:value={currentItem.duration}
								class="w-24 border-white/20 bg-white/10 text-center text-white"
								step="0.1"
							/>
						</div>
						<button
							class="ml-4 text-sm text-red-400 hover:underline"
							onclick={(e) => {
								e.stopPropagation();
								deleteCurrentItem();
							}}
						>
							Delete
						</button>
					{:else}
						<div class="text-white/40">
							{activeTab === 'images'
								? 'Select image to edit details'
								: 'Add subtitle to edit details'}
						</div>
					{/if}
				</div>
			</div>

			<!-- Bottom Player Bar (Edit mode only) -->
			<div class="flex h-20 items-center gap-4 border-t border-white/5 bg-[#1e1e1e] px-6">
				<!-- Play/Pause -->
				<button onclick={togglePlay} class="shrink-0 p-2 transition-colors hover:text-primary">
					{#if chapter.player.status === 'playing'}
						<PauseIcon class="h-8 w-8 fill-current" />
					{:else}
						<PlayIcon class="h-8 w-8 fill-current" />
					{/if}
				</button>

				<!-- Timeline -->
				<div class="flex flex-1 items-center gap-4">
					<ChapterProgressView {chapter} class="flex-1" />
					<div class="font-mono text-sm text-white/80">
						<TimeView seconds={chapter.player.duration ?? 0} />
					</div>
				</div>

				<!-- Audio Upload Button -->
				<button
					onclick={handleAudioSelect}
					class="flex items-center gap-2 font-bold text-red-500 transition-colors hover:text-red-400"
				>
					<PlusIcon class="h-8 w-8" />
					<span>Audio</span>
				</button>
			</div>
		</div>
	{/if}
{/if}
