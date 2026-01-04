<script lang="ts">
	import { page } from '$app/state';
	import { Portal } from 'bits-ui';
	import GlobalAudioPlayer from '$lib/app/concepts/Book/GlobalAudioPlayer.svelte';
	import { globalPlayer } from '$lib/app/concepts/Book/globalPlayer.svelte';
	import { fly } from 'svelte/transition';
	import Navbar from '$lib/designSystem/components/Navbar/Navbar.svelte';

	let { children } = $props();

	// Check if we are on the chapter page where the player is already shown
	const isChapterPage = $derived(
		page.route.id?.startsWith('/(app)/books/[bookId]/chapters/[chapterId]') ?? false
	);
</script>

<Navbar />

{@render children()}

{#if !isChapterPage && globalPlayer.status !== 'pending'}
	<div class="h-24 w-full"></div>
	<Portal>
		<div
			transition:fly={{ y: '100%', duration: 300 }}
			class="fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl border-t border-stone-800 bg-stone-900/90 p-2 pb-6 backdrop-blur-md md:pb-2"
		>
			<GlobalAudioPlayer />
		</div>
	</Portal>
{/if}
