import { resolve } from '$app/paths';
import { genreSchema } from '$lib/app/concepts/Book/Book.schema';
import { z } from 'zod';
import type { QueryState } from './query';

// Define response schemas for genres
export const genreResponseSchema = genreSchema;
export const genresResponseSchema = z.array(genreSchema);

export type Genre = z.infer<typeof genreSchema>;

const genresQueryState = $state<QueryState<Genre[]>>({
	data: [],
	isPending: false,
	isError: false,
	lastUpdated: 0,
	staleTime: 60 * 60 * 1000 // 1 hour
});

export type GenresQueryState = typeof genresQueryState;

export async function createGenre(genre: Omit<Genre, 'id'>) {
	const response = await fetch(resolve('/api/genres'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(genre)
	});

	if (!response.ok) {
		throw new Error('Failed to create genre');
	}

	const data = await response.json();

	// Validate response with Zod
	const validatedData = genreResponseSchema.parse(data);

	return validatedData;
}

export async function getGenres(force = false): Promise<GenresQueryState> {
	if (!force && genresQueryState.isPending) {
		return genresQueryState;
	}
	// Check if data is fresh enough using staleTime
	const isFresh = Date.now() - genresQueryState.lastUpdated < genresQueryState.staleTime;
	if (!force && isFresh && genresQueryState.data && genresQueryState.data.length > 0) {
		return genresQueryState;
	}

	genresQueryState.isPending = true;

	try {
		const response = await fetch(resolve('/api/genres'));
		if (!response.ok) {
			throw new Error('Failed to fetch genres');
		}

		const data = await response.json();

		// Validate response with Zod
		const validatedData = genresResponseSchema.parse(data);

		genresQueryState.data = validatedData;
		genresQueryState.isPending = false;
		genresQueryState.isError = false;
		genresQueryState.lastUpdated = Date.now();
	} catch (error) {
		console.error('Error getting genres', error);
		genresQueryState.isError = true;
		genresQueryState.isPending = false;
	}

	return genresQueryState;
}
