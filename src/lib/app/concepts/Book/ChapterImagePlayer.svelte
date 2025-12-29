<script lang="ts">
	import type { Chapter } from './Book.svelte';
	import { cc } from '$lib/designSystem/utils/miscellaneous';
	import { getMediaDownloadUrl } from './Player.svelte';
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

	let currentImage = $derived.by(() => {
		if (!chapter) return undefined;
		const time = currentTime;
		return chapter.images?.find((img) => {
			const start = img.timestamp ?? 0;
			const end = start + (img.duration ?? 0);
			return time >= start && time < end;
		});
	});

	// Cache for resolved image URLs
	const imageUrlCache = new Map<string, string>();
	let resolvedImageUrl = $state<string | undefined>(undefined);

	// Resolve the image URL (handles both blob URLs and storage paths)
	$effect(() => {
		const imageLink = currentImage?.imageLink;
		if (!imageLink) {
			resolvedImageUrl = undefined;
			return;
		}

		// If it's already a blob URL or full URL, use directly
		if (imageLink.startsWith('blob:') || imageLink.startsWith('http')) {
			resolvedImageUrl = imageLink;
			return;
		}

		// Check cache first
		if (imageUrlCache.has(imageLink)) {
			resolvedImageUrl = imageUrlCache.get(imageLink);
			return;
		}

		// Resolve Firebase Storage path to download URL
		getMediaDownloadUrl(imageLink)
			.then((url) => {
				imageUrlCache.set(imageLink, url);
				resolvedImageUrl = url;
			})
			.catch((err) => {
				console.error('Failed to resolve image URL:', err);
				resolvedImageUrl = undefined;
			});
	});
</script>

<div class={cc('relative h-full w-full overflow-hidden bg-black', className)}>
	{#if resolvedImageUrl}
		<img
			src={resolvedImageUrl}
			alt="Chapter Visual"
			class="h-full w-full object-contain transition-opacity duration-300"
		/>
	{:else}
		<div class="flex h-full w-full items-center justify-center text-white/30">
			<span class="text-2xl font-bold">No Visual</span>
		</div>
	{/if}
</div>
