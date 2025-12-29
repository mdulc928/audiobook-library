import { SvelteHowl } from './SvelteHowl.svelte';
import { getMediaDownloadUrl } from './Player.svelte';

/**
 * Global audio player that persists across navigation.
 * This allows us to start playing audio on one page and continue on another.
 */
class GlobalPlayer {
	// Current audio instance
	#audio = $state<SvelteHowl | undefined>(undefined);
	#isInitializing = $state(false);

	// Currently playing chapter info
	currentChapterId = $state<string | undefined>(undefined);
	currentBookId = $state<string | undefined>(undefined);

	get isInitializing() {
		return this.#isInitializing;
	}

	get status(): 'pending' | 'playing' | 'paused' {
		if (!this.#audio) {
			return 'pending';
		}
		if (this.#audio.playing) {
			return 'playing';
		}
		if (this.#audio.state === 'loaded') {
			return 'paused';
		}
		return 'pending';
	}

	get duration() {
		return this.#audio?.duration ?? 0;
	}

	get currentTime() {
		return this.#audio?.currentTime ?? 0;
	}

	get isPlaying() {
		return this.status === 'playing';
	}

	/**
	 * Play a chapter's audio. If a different chapter is currently playing, switch to the new one.
	 */
	async playChapter(bookId: string, chapterId: string, audioSrc: string) {
		// If same chapter, just play/resume
		if (this.currentChapterId === chapterId && this.currentBookId === bookId && this.#audio) {
			if (!this.#audio.playing) {
				this.#audio.play();
			}
			return;
		}

		// Stop current audio if any
		this.stop();

		// Set current chapter
		this.currentBookId = bookId;
		this.currentChapterId = chapterId;

		if (!audioSrc) {
			console.warn('[GlobalPlayer] No audio source provided');
			return;
		}

		this.#isInitializing = true;
		try {
			const audioUrl = await getMediaDownloadUrl(audioSrc);

			this.#audio = new SvelteHowl({
				src: [audioUrl],
				html5: true,
				autoplay: true, // Auto-play when loaded
				preload: true,
				onload: () => {
					console.log('[GlobalPlayer] Audio loaded');
				},
				onloaderror: (soundId: number, error: unknown) => {
					console.error('[GlobalPlayer] Error loading audio:', error, soundId);
				},
				onend: () => {
					console.log('[GlobalPlayer] Audio ended');
				}
			});
		} catch (error) {
			console.error('[GlobalPlayer] Failed to initialize audio:', error);
		} finally {
			this.#isInitializing = false;
		}
	}

	play() {
		this.#audio?.play();
	}

	pause() {
		this.#audio?.pause();
	}

	stop() {
		this.#audio?.stop();
		this.#audio = undefined;
	}

	seek(time: number) {
		this.#audio?.seek(time);
	}

	/**
	 * Check if a specific chapter is currently playing
	 */
	isChapterPlaying(bookId: string, chapterId: string) {
		return (
			this.currentBookId === bookId &&
			this.currentChapterId === chapterId &&
			this.status === 'playing'
		);
	}
}

// Singleton instance
export const globalPlayer = new GlobalPlayer();
