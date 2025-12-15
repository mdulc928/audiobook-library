import { sumBy } from 'es-toolkit';
import { browser } from '$app/environment';
import { Howler } from 'howler';
import { onMount } from 'svelte';
import { on } from 'svelte/events';
import { SvelteHowl } from './SvelteHowl.svelte';

export class Book {
	id = $state<string>();
	title = $state<string>();
	author = $state<string[]>();
	chapters = $state<Chapter[]>();
	cover = $state<BookImage>();
	duration = $derived.by(() => {
		return sumBy(this.chapters ?? [], (chapter) => chapter?.duration ?? 0);
	});

	constructor(data: {
		id?: string;
		title?: string;
		author?: string[];
		chapters?: (Chapter | ReturnType<Chapter['toPOJO']>)[];
		cover?: BookImage | ReturnType<BookImage['toPOJO']>;
	}) {
		this.id = data.id ?? crypto.randomUUID();
		this.title = data.title;
		this.author = data.author;
		this.chapters = data.chapters?.map((c) => (c instanceof Chapter ? c : new Chapter(c)));
		this.cover =
			data.cover instanceof BookImage
				? data.cover
				: data.cover
					? new BookImage(data.cover)
					: undefined;
	}

	toPOJO() {
		return {
			id: this.id,
			title: this.title,
			author: this.author,
			chapters: this.chapters?.map((chapter) => chapter.toPOJO()) ?? [],
			cover: this.cover?.toPOJO() ?? {},
			duration: this.duration ?? 0
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

	#player: Player;

	constructor(data: {
		id?: string;
		title?: string;
		audioSrc?: string;
		duration?: number;
		length?: number; // Handle potential alias from POJO
		images?: (BookImage | ReturnType<BookImage['toPOJO']>)[];
		subtitles?: (Subtitle | ReturnType<Subtitle['toPOJO']>)[];
	}) {
		this.id = data.id ?? crypto.randomUUID();
		this.title = data.title;
		this.audioSrc = data.audioSrc;
		this.duration = data.duration ?? data.length ?? 0;
		this.images = data.images?.map((i) => (i instanceof BookImage ? i : new BookImage(i))) ?? [];
		this.subtitles =
			data.subtitles?.map((s) => (s instanceof Subtitle ? s : new Subtitle(s))) ?? [];
		this.#player = new Player({ duration: this.duration, src: this.audioSrc ?? '' });
	}

	get player() {
		return this.#player;
	}

	toPOJO() {
		return {
			id: this.id,
			title: this.title,
			audioSrc: this.audioSrc,
			length: this.duration,
			images: this.images.map((image) => image.toPOJO()),
			subtitles: this.subtitles
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

	constructor(data: { imageLink?: string; timestamp?: number; duration?: number }) {
		this.imageLink = data.imageLink;
		this.timestamp = data.timestamp;
		this.duration = data.duration;
	}

	toPOJO() {
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

	constructor(data: { timestamp?: number; duration?: number; text?: string }) {
		this.duration = data.duration;
		this.timestamp = data.timestamp;
		this.text = data.text;
	}

	toPOJO() {
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

	constructor(data: { duration: number; src: string }) {
		this.#initialDuration = data.duration;

		onMount(() => {
			this.#audio = new SvelteHowl({
				src: [data.src],
				html5: true,
				autoplay: false,
				preload: true,
				onloaderror: (soundId, error) => {
					console.error('error', error, soundId);
				}
			});
			return () => {
				console.log('unload');
				this.#audio?.unload();
			};
		});
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
