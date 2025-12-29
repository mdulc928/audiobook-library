<script lang="ts">
	import type { Chapter } from './Book.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { globalPlayer } from './globalPlayer.svelte';

	let {
		chapter,
		class: className,
		useGlobalPlayer = false
	}: {
		chapter: Chapter;
		class?: string;
		useGlobalPlayer?: boolean;
	} = $props();

	// Get current time from either global player or chapter player
	let currentTime = $derived(
		useGlobalPlayer ? globalPlayer.currentTime : (chapter?.player?.currentTime ?? 0)
	);

	let currentSubtitle = $derived.by(() => {
		if (!chapter) return undefined;
		const time = currentTime;
		return chapter.subtitles?.find((sub) => {
			const start = sub.timestamp ?? 0;
			const end = start + (sub.duration ?? 0);
			return time >= start && time < end;
		});
	});
</script>

{#if currentSubtitle?.text}
	<div
		class={cc(
			'pointer-events-none absolute bottom-8 left-0 flex w-full justify-center px-12',
			className
		)}
	>
		<div
			class="rounded-xl bg-black/60 px-6 py-3 text-center text-xl font-medium text-white backdrop-blur-md"
		>
			{currentSubtitle.text}
		</div>
	</div>
{/if}
