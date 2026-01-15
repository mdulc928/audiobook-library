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

	let playerHeight = $state(0);
</script>

<Navbar />

{@render children()}
<footer class="mx-auto my-4 w-full text-center">
	<a
		href="https://wilmeltech.com"
		target="_blank"
		class="align-self-start text-sm text-stone-400 underline">WilMel TechTonic, Inc. © 2026</a
	>
</footer>
{#if !isChapterPage && globalPlayer.status !== 'pending'}
	<div class=" w-full" style="height: {playerHeight}px"></div>
	<Portal>
		<div
			bind:clientHeight={playerHeight}
			transition:fly={{ y: '100%', duration: 300 }}
			class="fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl border-t border-stone-800 bg-stone-900/90 p-2 pb-6 backdrop-blur-md md:pb-2"
		>
			<GlobalAudioPlayer />
		</div>
	</Portal>
{/if}
