<script lang="ts">
	import Button from '$lib/designSystem/components/Button/Button.svelte';
	import Progress from '$lib/designSystem/components/Progress/Progress.svelte';
	import { Chapter } from './Book.svelte';

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
	{chapter.player.currentTime}

	<Progress
		value={chapter.player.currentTime}
		min={0}
		max={chapter.player.duration}
		class="h-4 w-full"
	>
		<div>Hello</div>
	</Progress>
</div>
