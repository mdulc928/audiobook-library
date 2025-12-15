<script lang="ts">
	import Button from '$lib/designSystem/components/Button/Button.svelte';

	import { Chapter } from './Book.svelte';
	import ChapterProgressView from './ChapterProgressView.svelte';

	let { chapter }: { chapter: Chapter } = $props();
</script>

<div class="w-full">
	Hello
	<Button
		onclick={() => {
			if (chapter.player.status !== 'playing') {
				chapter.player.play();
			} else {
				chapter.player.pause();
			}
		}}
		>{chapter.player.status !== 'playing' ? 'Play' : 'Pause'}
	</Button>
	{chapter.player.duration}
	{chapter.player.audio?.state}
	<ChapterProgressView {chapter} />
</div>
