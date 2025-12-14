import { Howl } from 'howler';
import { createSubscriber } from 'svelte/reactivity';

export class SvelteHowl {
	#howl: Howl;
	#soundId: number | undefined;
	#subscribe: () => void;
	#update: (() => void) | undefined;

	constructor(config: {
		src: string | string[];
		html5?: boolean;
		autoplay?: boolean;
		preload?: boolean | 'metadata';
		volume?: number;
		loop?: boolean;
		onload?: (id: number) => void;
		onloaderror?: (soundId: number, error: any) => void;
		onplay?: (id: number) => void;
		onpause?: (id: number) => void;
		onend?: (id: number) => void;
		onseek?: (id: number) => void;
		onvolume?: (id: number) => void;
	}) {
		// Create a subscriber that will trigger reactivity when Howler events occur
		this.#subscribe = createSubscriber((update) => {
			// Store the update function so we can call it from event handlers
			this.#update = update;

			// Set up an interval to track current time changes
			// This is needed because Howler doesn't emit events for time updates
			const interval = setInterval(() => {
				if (this.#howl && this.#howl.playing(this.#soundId)) {
					update();
				}
			}, 100); // Update every 100ms for smooth progress tracking

			// Return cleanup function
			return () => {
				clearInterval(interval);
				this.#update = undefined;
			};
		});

		this.#howl = new Howl({
			src: config.src,
			html5: config.html5 ?? true,
			autoplay: config.autoplay ?? false,
			preload: config.preload ?? true,
			volume: config.volume ?? 1,
			loop: config.loop ?? false,
			onload: (id) => {
				this.#soundId = id;
				this.#update?.();
				config.onload?.(id);
			},
			onloaderror: (soundId, error) => {
				config.onloaderror?.(soundId, error);
			},
			onplay: (id) => {
				this.#update?.();
				config.onplay?.(id);
			},
			onpause: (id) => {
				this.#update?.();
				config.onpause?.(id);
			},
			onend: (id) => {
				this.#update?.();
				config.onend?.(id);
			},
			onseek: (id) => {
				this.#update?.();
				config.onseek?.(id);
			},
			onvolume: (id) => {
				this.#update?.();
				config.onvolume?.(id);
			}
		});
	}

	// Reactive getters that trigger reactivity when accessed in effects
	get playing() {
		this.#subscribe();
		return this.#howl.playing(this.#soundId);
	}

	get paused() {
		this.#subscribe();
		return this.#howl.playing(this.#soundId) === false && this.#howl.seek(this.#soundId) > 0;
	}

	get currentTime() {
		this.#subscribe();
		return this.#howl.seek(this.#soundId) ?? 0;
	}

	get duration() {
		this.#subscribe();
		return this.#howl.duration(this.#soundId) ?? 0;
	}

	get volume() {
		this.#subscribe();
		return this.#howl.volume();
	}

	get state() {
		this.#subscribe();
		return this.#howl.state();
	}

	get loaded() {
		this.#subscribe();
		return this.#howl.state() === 'loaded';
	}

	// Methods to control playback
	play(id?: number) {
		const playId = this.#howl.play(id ?? this.#soundId);
		this.#soundId = playId;
		this.#update?.();
		return playId;
	}

	pause(id?: number) {
		this.#howl.pause(id ?? this.#soundId);
		this.#update?.();
		return this;
	}

	stop(id?: number) {
		this.#howl.stop(id ?? this.#soundId);
		this.#update?.();
		return this;
	}

	seek(seek: number, id?: number) {
		this.#howl.seek(seek, id ?? this.#soundId);
		this.#update?.();
		return this;
	}

	setVolume(volume: number) {
		this.#howl.volume(volume);
		this.#update?.();
		return this;
	}

	unload() {
		this.#howl.unload();
		return this;
	}

	// Get the underlying Howl instance if needed
	get howl() {
		return this.#howl;
	}

	get soundId() {
		return this.#soundId;
	}
}
