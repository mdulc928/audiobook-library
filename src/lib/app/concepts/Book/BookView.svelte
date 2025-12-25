<script lang="ts">
	import { Book } from './Book.svelte';
	import ChapterView from './ChapterView.svelte';
	import Heading from '$lib/designSystem/components/Heading/Heading.svelte';

	let { book }: { book: Book } = $props();
</script>

<div class="flex w-full flex-col">
	<div class="flex flex-col gap-2 px-2 pb-4">
		<Heading>{book.title}</Heading>
		{book.author}
		<span class="text-sm text-gray-500">{book.duration} minutes</span>
	</div>
	<div class="flex flex-col gap-2.5">
		{#each book.chapters as chapter (chapter.id)}
			<ChapterView {chapter} />
		{/each}
	</div>
</div>
