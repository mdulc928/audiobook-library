import { sumBy } from 'es-toolkit';
import type { BookData, ChapterData, BookImageData, SubtitleData } from './Book.schema';
import { Player, getMediaDownloadUrl } from './Player.svelte';

export class Book {
	id = $state<string>();
	title = $state<string>();
	description = $state<string>();
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
		this.description = data.description;
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
			description: this.description,
			author: this.author,
			chapters: this.chapters?.map((chapter) => chapter.toPOJO()),
			cover: this.cover?.toPOJO(),
			duration: this.duration,
			genres: this.genres,
			topics: this.topics,
			tags: this.tags,
			moods: this.moods,
			language: this.language
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
	#player: Player | undefined = $state();
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

export class BookRepository {
	private books: Book[] = [];

	async getBooks(): Promise<Book[]> {
		return this.books;
	}
}
