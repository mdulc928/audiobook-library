import { SvelteHowl } from './SvelteHowl.svelte';
import { getMediaDownloadUrl } from './Player.svelte';
import { browser } from '$app/environment';
import type { Chapter } from './Book.svelte';
import type { IPlayer } from './IPlayer';

/**
 * Global audio player that persists across navigation.
 * This allows us to start playing audio on one page and continue on another.
 */
class GlobalPlayer implements IPlayer {
	// Current audio instance
	#audio = $state<SvelteHowl>();
	#isInitializing = $state(false);

	// Currently playing chapter info
	currentChapterId = $state<string>();
	currentBookId = $state<string>();
	currentChapter = $state<Chapter>(); // Store full chapter for UI

	// Pending state (for when we load from storage but haven't started playing)
	#pendingState = $state<{ currentTime: number; duration: number } | undefined>(undefined);
	#saveInterval: ReturnType<typeof setInterval> | undefined;

	constructor() {
		if (browser) {
			this.#loadState();
			// Save progress periodically
			this.#saveInterval = setInterval(() => {
				if (this.isPlaying) {
					this.#saveState();
				}
			}, 5000);
		}
	}

	destroy() {
		if (this.#saveInterval) {
			clearInterval(this.#saveInterval);
			this.#saveInterval = undefined;
		}
	}

	get isInitializing() {
		return this.#isInitializing;
	}

	get status(): 'pending' | 'playing' | 'paused' {
		if (!this.#audio) {
			return this.#pendingState ? 'paused' : 'pending';
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
		return this.#audio?.duration ?? this.#pendingState?.duration ?? 0;
	}

	get currentTime() {
		return this.#audio?.currentTime ?? this.#pendingState?.currentTime ?? 0;
	}

	get isPlaying() {
		return this.status === 'playing';
	}

	#saveState() {
		if (!browser) return;

		const state = {
			currentBookId: this.currentBookId,
			currentChapterId: this.currentChapterId,
			currentChapter:
				typeof this.currentChapter?.toPOJO === 'function'
					? this.currentChapter.toPOJO()
					: this.currentChapter, // Persist chapter metadata
			currentTime: this.currentTime,
			duration: this.duration,
			audioSrc: this.currentChapter?.audioSrc
		};
		localStorage.setItem('globalPlayerState', JSON.stringify(state));
		console.log('Global player state saved:', state);
	}

	#loadState() {
		if (!browser) return;
		const stored = localStorage.getItem('globalPlayerState');
		if (stored) {
			try {
				const state = JSON.parse(stored);
				if (state.currentBookId && state.currentChapterId) {
					this.currentBookId = state.currentBookId;
					this.currentChapterId = state.currentChapterId;
					this.currentChapter = state.currentChapter;
					this.#pendingState = {
						currentTime: state.currentTime || 0,
						duration: state.duration || 0
					};

					if (this.currentChapter?.audioSrc) {
						this.#initAudio(this.currentChapter.audioSrc, this.#pendingState.currentTime, false);
					}
				}
				console.log('Global player state loaded:', state);
			} catch (e) {
				console.error('Failed to load player state', e);
			}
		}
	}

	async #initAudio(audioSrc: string, startTime?: number, autoplay = false) {
		this.#isInitializing = true;
		try {
			const audioUrl = await getMediaDownloadUrl(audioSrc);

			this.#audio = new SvelteHowl({
				src: [audioUrl],
				html5: true, // Force HTML5 Audio to support large files and potentially HLS if supported by browser
				autoplay: autoplay,
				preload: true,
				onload: () => {
					console.log('[GlobalPlayer] Audio loaded');
					if (startTime) {
						this.#audio?.seek(startTime);
					}
				},
				onloaderror: (soundId: number, error: unknown) => {
					console.error('[GlobalPlayer] Error loading audio:', error, soundId);
				},
				onend: () => {
					console.log('[GlobalPlayer] Audio ended');
					this.#saveState(); // Save finished state
				}
			});
		} catch (error) {
			console.error('[GlobalPlayer] Failed to initialize audio:', error);
		} finally {
			this.#isInitializing = false;
		}
	}

	/**
	 * Play a chapter's audio. If a different chapter is currently playing, switch to the new one.
	 */
	async playChapter(bookId: string, chapter: Chapter, startTime?: number) {
		const chapterId = chapter.id;
		const audioSrc = chapter.audioSrc;

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
		this.currentChapter = chapter;
		this.#pendingState = undefined;

		if (!audioSrc) {
			console.warn('[GlobalPlayer] No audio source provided');
			return;
		}

		await this.#initAudio(audioSrc, startTime, true);
		this.#saveState();
	}

	play() {
		this.#audio?.play();
		this.#saveState();
	}

	pause() {
		this.#audio?.pause();
		this.#saveState();
	}

	stop() {
		this.#audio?.stop();
		this.#audio = undefined;
		this.#saveState();
	}

	seek(time: number) {
		if (this.#audio) {
			this.#audio.seek(time);
			this.#saveState();
		} else if (this.#pendingState) {
			// Update pending state if we are seeking while paused/not loaded
			this.#pendingState.currentTime = time;
		}
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
