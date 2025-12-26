import { sumBy } from 'es-toolkit';
import { SvelteHowl } from './SvelteHowl.svelte';
import type { BookData, ChapterData, BookImageData, SubtitleData } from './Book.schema';
import { resolve } from '$app/paths';

/**
 * Helper function to get download URL from a storage path via backend endpoint
 */
async function getMediaDownloadUrl(path: string): Promise<string> {
	// If it's already a full URL, return it
	if (path.startsWith('http')) {
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

export class Book {
	id = $state<string>();
	title = $state<string>();
	author = $state<string[]>();
	chapters = $state<Chapter[]>();
	cover = $state<BookImage>();
	duration = $derived.by(() => {
		return sumBy(this.chapters ?? [], (chapter) => chapter?.duration ?? 0);
	});
	genres = $state<string[]>([]);
	topics = $state<string[]>([]);
	tags = $state<string[]>([]);
	moods = $state<string[]>([]);
	language = $state<string>();

	constructor(data: BookData) {
		this.id = data.id ?? crypto.randomUUID();
		this.title = data.title;
		this.author = data.author;
		this.chapters = data.chapters?.map((c) => new Chapter(c));
		this.cover = data.cover ? new BookImage(data.cover) : undefined;
		this.genres = data.genres ?? [];
		this.topics = data.topics ?? [];
		this.tags = data.tags ?? [];
		this.moods = data.moods ?? [];
		this.language = data.language ?? '';
	}

	/**
	 * Gets the download URL for the book cover
	 */
	async getCoverUrl(): Promise<string | null> {
		if (!this.cover?.imageLink) return null;
		return this.cover.getDownloadUrl();
	}

	toPOJO(): BookData {
		return {
			id: this.id,
			title: this.title,
			author: this.author,
			chapters: this.chapters?.map((chapter) => chapter.toPOJO()),
			cover: this.cover?.toPOJO(),
			duration: this.duration
		};
	}
	toString() {
		return JSON.stringify(this.toPOJO());
	}
}

export class Chapter {
	id = $state<string>();
	title = $state<string>();
	audioSrc = $state<string>();
	duration = $state<number>();
	images: BookImage[] = $state([]);
	subtitles: Subtitle[] = $state([]);
	#player: Player | undefined;
	#playerData: { duration: number; src: string };

	constructor(data: ChapterData) {
		this.id = data.id;
		this.title = data.title;
		this.audioSrc = data.audioSrc;
		this.duration = data.duration ?? 0;
		this.images = data.images?.map((i) => new BookImage(i)) ?? [];
		this.subtitles = data.subtitles?.map((s) => new Subtitle(s)) ?? [];
		// Store player data but don't initialize Player yet (it needs component context)
		this.#playerData = { duration: this.duration, src: this.audioSrc ?? '' };
	}

	get player() {
		// Lazy initialization - only create Player when accessed in component context
		if (!this.#player) {
			this.#player = new Player(this.#playerData);
		}
		return this.#player;
	}

	/**
	 * Gets the download URL for the chapter audio
	 */
	async getAudioUrl(): Promise<string | null> {
		if (!this.audioSrc) return null;
		try {
			return await getMediaDownloadUrl(this.audioSrc);
		} catch (error) {
			console.error(`Error getting audio URL for chapter ${this.id}:`, error);
			return null;
		}
	}

	/**
	 * Gets download URLs for all images in this chapter
	 */
	async getImageUrls(): Promise<string[]> {
		const urls = await Promise.all(
			this.images.map(async (image) => {
				try {
					return await image.getDownloadUrl();
				} catch (error) {
					console.error(`Error getting image URL for chapter ${this.id}:`, error);
					return null;
				}
			})
		);
		return urls.filter((url): url is string => url !== null);
	}

	toPOJO(): ChapterData {
		return {
			id: this.id,
			title: this.title,
			audioSrc: this.audioSrc,
			duration: this.duration,
			images: this.images.map((image) => image.toPOJO()),
			subtitles: this.subtitles.map((subtitle) => subtitle.toPOJO())
		};
	}
	toString() {
		return JSON.stringify(this.toPOJO());
	}
}

export class BookImage {
	imageLink = $state<string>();
	alt = $state<string>('');
	timestamp = $state<number>();
	duration = $state<number>();

	constructor(data: BookImageData) {
		this.imageLink = data.imageLink;
		this.timestamp = data.timestamp;
		this.duration = data.duration;
	}

	/**
	 * Gets the download URL for the image
	 */
	async getDownloadUrl(): Promise<string> {
		if (!this.imageLink) {
			throw new Error('No image link available');
		}
		return await getMediaDownloadUrl(this.imageLink);
	}

	toPOJO(): BookImageData {
		return {
			imageLink: this.imageLink,
			timestamp: this.timestamp,
			duration: this.duration
		};
	}
	toString() {
		return JSON.stringify(this.toPOJO());
	}
}

export class Subtitle {
	timestamp = $state<number>();
	duration = $state<number>();
	text = $state<string>();

	constructor(data: SubtitleData) {
		this.duration = data.duration;
		this.timestamp = data.timestamp;
		this.text = data.text;
	}

	toPOJO(): SubtitleData {
		return {
			duration: this.duration,
			timestamp: this.timestamp,
			text: this.text
		};
	}

	toString() {
		return JSON.stringify(this.toPOJO());
	}
}

export class Player {
	#audio = $state<SvelteHowl | undefined>(undefined);
	#initialDuration = $state<number>();
	#src: string;
	#isInitializing = $state(false);

	constructor(data: { duration: number; src: string }) {
		this.#initialDuration = data.duration;
		this.#src = data.src;
		// Start initializing immediately
		this.#initializeAudio();
	}

	async #initializeAudio() {
		if (this.#isInitializing || this.#audio) return;
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

	get status(): 'playing' | 'paused' | 'pending' | 'seeking' {
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

	get duration() {
		if (!this.#audio) {
			return this.#initialDuration;
		}
		const audioDuration = this.#audio.duration;
		return audioDuration > 0 ? audioDuration : this.#initialDuration;
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

export class BookRepository {
	private books: Book[] = [];

	async getBooks(): Promise<Book[]> {
		return this.books;
	}
}
