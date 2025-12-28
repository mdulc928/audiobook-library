import { Book } from '$lib/app/concepts/Book/Book.svelte';
import { bookResponseSchema, booksResponseSchema } from '$lib/app/concepts/Book/Book.schema';
import { resolve } from '$app/paths';
import { getGenres, genresQueryState } from '$lib/app/api/genres.svelte';
import type { QueryState } from './query';

const booksQueryState = $state<QueryState<Book[]>>({
	data: [],
	isPending: false,
	isError: false,
	lastUpdated: 0,
	staleTime: 60 * 60 * 1000 // 1 hour
});

export type BooksQueryState = typeof booksQueryState;

export async function createBook(book: Book) {
	const response = await fetch(resolve('/api/books'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: book.toString()
	});

	if (!response.ok) {
		throw new Error('Failed to create book');
	}

	const data = await response.json();

	// Validate response with Zod
	const validatedData = bookResponseSchema.parse(data);

	return validatedData;
}

export async function getBooks(force = false): Promise<BooksQueryState> {
	if (!force && booksQueryState.isPending) {
		return booksQueryState;
	}
	const response = await fetch(resolve('/api/books'));
	if (!response.ok) {
		throw new Error('Failed to fetch books');
	}

	const data = await response.json();

	// Validate response with Zod
	const validatedData = booksResponseSchema.parse(data);

	// Fetch genres to map IDs to Names
	// We rely on getGenres caching so this isn't expensive on subsequent calls
	await getGenres();
	const genres = genresQueryState.data || [];

	// Map genre IDs to Names
	const booksWithGenreNames = validatedData.map((d) => {
		if (d.genres) {
			d.genres = d.genres.map((gId) => {
				const genre = genres.find((g) => g.id === gId);
				return genre ? genre.name || gId : gId;
			});
		}
		return new Book(d);
	});

	// Cast to unknown first to satisfy TypeScript, as Zod validates the structure at runtime
	booksQueryState.data = booksWithGenreNames;
	booksQueryState.isPending = false;
	booksQueryState.isError = false;
	booksQueryState.lastUpdated = Date.now();
	booksQueryState.staleTime = 60 * 60 * 1000; // 1 hour

	return booksQueryState;
}

export async function getBook(id: string) {
	const response = await fetch(resolve(`/api/books/${id}`));
	if (!response.ok) {
		throw new Error('Failed to fetch book');
	}
	const data = await response.json();
	const validatedData = bookResponseSchema.parse(data);

	// Fetch genres to map IDs to Names
	await getGenres();
	const genres = genresQueryState.data || [];

	if (validatedData.genres) {
		validatedData.genres = validatedData.genres.map((gId) => {
			const genre = genres.find((g) => g.id === gId);
			return genre ? genre.name || gId : gId;
		});
	}

	return new Book(validatedData);
}

export async function updateBook(book: Book) {
	const response = await fetch(resolve(`/api/books/${book.id}`), {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: book.toString()
	});

	if (!response.ok) {
		throw new Error('Failed to update book');
	}

	const data = await response.json();
	return bookResponseSchema.parse(data);
}

export async function deleteBook(id: string) {
	const response = await fetch(resolve(`/api/books/${id}`), {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error('Failed to delete book');
	}
	return true;
}
