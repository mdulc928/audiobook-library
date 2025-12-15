<script lang="ts">
	import { Chapter } from './Book.svelte';
	import ChapterAudioPlayer from './ChapterAudioPlayer.svelte';
	import Heading from '$lib/designSystem/components/Heading/Heading.svelte';

	let { chapter }: { chapter: Chapter } = $props();
</script>

<svelte:boundary>
	<div class="flex flex-col gap-2 px-2">
		<Heading level={6}>
			{chapter.title}
		</Heading>
		<ChapterAudioPlayer {chapter} class="pl-0" />
	</div>
	{#snippet failed()}
		Sorry. Failed to Display Chapter
	{/snippet}
</svelte:boundary>
