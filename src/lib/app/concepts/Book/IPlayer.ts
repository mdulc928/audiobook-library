/**
 * Common interface for audio players.
 * Both Player and GlobalPlayer implement this interface,
 * allowing components to accept either type.
 */
export interface IPlayer {
	readonly status: 'playing' | 'paused' | 'pending';
	readonly duration: number;
	readonly currentTime: number;
	play(): void;
	pause(): void;
	seek(time: number): void;
}
