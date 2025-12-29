import { getAppStorage } from '$lib/app/firebase.client.svelte';
import { ref, uploadBytes } from 'firebase/storage';
import { getMediaDownloadUrl } from './Player.svelte';

/**
 * Upload an image file to Firebase Storage
 * @returns The storage path (not a download URL)
 */
export async function uploadChapterImage(
	bookId: string,
	chapterId: string,
	file: File
): Promise<string | null> {
	const storage = getAppStorage();
	if (!storage) return null;

	const fileExtension = file.name.split('.').pop();
	const uniqueId = crypto.randomUUID();
	const storagePath = `books/${bookId}/chapters/${chapterId}/images/${uniqueId}.${fileExtension}`;
	const storageRef = ref(storage, storagePath);
	await uploadBytes(storageRef, file);
	return storagePath;
}

/**
 * Upload an audio file to Firebase Storage
 * @returns The storage path (not a download URL)
 */
export async function uploadChapterAudio(
	bookId: string,
	chapterId: string,
	file: File
): Promise<string | null> {
	const storage = getAppStorage();
	if (!storage) return null;

	const fileExtension = file.name.split('.').pop();
	const uniqueId = crypto.randomUUID();
	const storagePath = `books/${bookId}/chapters/${chapterId}/audio/${uniqueId}.${fileExtension}`;
	const storageRef = ref(storage, storagePath);
	await uploadBytes(storageRef, file);
	return storagePath;
}

/**
 * Open a file picker dialog and return the selected file
 */
export function openFilePicker(accept: string): Promise<File | null> {
	return new Promise((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = accept;
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0] ?? null;
			resolve(file);
		};
		// Handle cancel (though not all browsers support this reliably)
		input.addEventListener('cancel', () => resolve(null));
		input.click();
	});
}

/**
 * Resolve a storage path or URL to a usable image URL.
 * Handles blob URLs, http URLs, and Firebase Storage paths.
 */
export async function resolveImageUrl(
	imageLink: string | undefined,
	cache: Map<string, string>
): Promise<string | undefined> {
	if (!imageLink) return undefined;

	// Blob URLs and full URLs can be used directly
	if (imageLink.startsWith('blob:') || imageLink.startsWith('http')) {
		return imageLink;
	}

	// Check cache
	if (cache.has(imageLink)) {
		return cache.get(imageLink);
	}

	// Resolve Firebase Storage path
	try {
		const url = await getMediaDownloadUrl(imageLink);
		cache.set(imageLink, url);
		return url;
	} catch (err) {
		console.error('Failed to resolve image URL:', err);
		return undefined;
	}
}

/**
 * Calculate the start time for a new item based on the previous item
 */
export function calculateNextStartTime(
	items: Array<{ timestamp?: number; duration?: number }>
): number {
	const lastItem = items.at(-1);
	if (!lastItem) return 0;
	return (lastItem.timestamp ?? 0) + (lastItem.duration ?? 0);
}
