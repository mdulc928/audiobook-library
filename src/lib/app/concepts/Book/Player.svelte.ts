import { SvelteHowl } from './SvelteHowl.svelte';
import { resolve } from '$app/paths';
import type { IPlayer } from './IPlayer';

/**
 * Helper function to get download URL from a storage path via backend endpoint
 */
export async function getMediaDownloadUrl(path: string): Promise<string> {
	// If it's already a full URL, return it
	if (path.startsWith('http') || path.startsWith('blob:')) {
		return path;
	}

	// Otherwise, call the backend endpoint to get the download URL
	const response = await fetch(resolve('/api/storage/download-url'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ path })
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to get download URL');
	}

	const data = await response.json();
	return data.url;
}

export class Player implements IPlayer {
	#audio = $state<SvelteHowl | undefined>(undefined);
	#initialDuration = $state<number>();
	#src = $state<string>();
	#isInitializing = $state(false);
	#format = $state<string[] | undefined>(undefined);

	constructor(data: { duration: number; src: string; format?: string[] }) {
		this.#initialDuration = data.duration;
		this.#src = data.src;
		this.#format = data.format;
		// Start initializing immediately
		this.#initializeAudio();
	}

	async #initializeAudio() {
		if (this.#isInitializing || this.#audio || !this.#src) return;
		this.#isInitializing = true;

		try {
			console.log('[Player] Initializing audio with src:', this.#src);
			// Get the download URL if src is a storage path
			const audioUrl = await getMediaDownloadUrl(this.#src);
			console.log('[Player] Got download URL:', audioUrl);

			this.#audio = new SvelteHowl({
				src: [audioUrl],
				html5: true,
				autoplay: false,
				preload: true,
				format: this.#format,
				onload: () => {
					console.log('[Player] Audio loaded successfully');
				},
				onloaderror: (soundId: number, error: unknown) => {
					console.error('[Player] Error loading audio:', error, soundId);
				}
			});
			console.log('[Player] SvelteHowl instance created');
		} catch (error) {
			console.error('[Player] Failed to initialize audio:', error);
		} finally {
			this.#isInitializing = false;
		}
	}

	async setSrc(src: string, format?: string[]) {
		if (this.#src === src && this.#format === format) return;
		this.#src = src;
		this.#format = format;
		if (this.#audio) {
			this.#audio.unload();
			this.#audio = undefined;
		}
		await this.#initializeAudio();
	}

	get status(): 'playing' | 'paused' | 'pending' {
		if (!this.#audio) {
			return 'pending';
		}
		if (this.#audio.playing) {
			return 'playing';
		}
		if (this.#audio.paused) {
			return 'paused';
		}
		return 'pending';
	}

	get duration(): number {
		if (!this.#audio) {
			return this.#initialDuration ?? 0;
		}
		const audioDuration = this.#audio.duration;
		return audioDuration > 0 ? audioDuration : (this.#initialDuration ?? 0);
	}

	get currentTime() {
		if (!this.#audio) {
			return 0;
		}
		return this.#audio.currentTime;
	}

	get audio() {
		return this.#audio;
	}

	play() {
		if (!this.#audio) {
			return;
		}
		this.#audio.play();
		// Update duration if available from audio
		const audioDuration = this.#audio.duration;
		if (audioDuration > 0 && audioDuration !== this.#initialDuration) {
			this.#initialDuration = audioDuration;
		}
	}

	pause() {
		if (!this.#audio) {
			return;
		}
		this.#audio.pause();
	}

	seek(time: number) {
		if (!this.#audio) {
			return;
		}
		this.#audio.seek(time);
	}
}
