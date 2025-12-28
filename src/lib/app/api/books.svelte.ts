import { Book } from '$lib/app/concepts/Book/Book.svelte';
import { bookResponseSchema, booksResponseSchema } from '$lib/app/concepts/Book/Book.schema';
import { resolve } from '$app/paths';
import { genresQueryState } from '$lib/app/api/genres.svelte';
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

	// Invalidate caches
	booksQueryState.lastUpdated = 0;
	genresQueryState.lastUpdated = 0;

	return validatedData;
}

export async function getBooks(force = false): Promise<BooksQueryState> {
	if (!force && booksQueryState.isPending) {
		return booksQueryState;
	}
	// Check staleness
	const isStale = Date.now() - booksQueryState.lastUpdated > booksQueryState.staleTime;
	if (!force && !isStale && (booksQueryState.data?.length ?? 0) > 0) {
		return booksQueryState;
	}

	booksQueryState.isPending = true;
	const response = await fetch(resolve('/api/books'));
	if (!response.ok) {
		throw new Error('Failed to fetch books');
	}

	const data = await response.json();

	// Validate response with Zod
	const validatedData = booksResponseSchema.parse(data);

	// Cast to unknown first to satisfy TypeScript, as Zod validates the structure at runtime
	booksQueryState.data = validatedData.map((d) => new Book(d));
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
	const validated = bookResponseSchema.parse(data);

	// Invalidate caches
	booksQueryState.lastUpdated = 0;
	genresQueryState.lastUpdated = 0;

	return validated;
}

export async function deleteBook(id: string) {
	const response = await fetch(resolve(`/api/books/${id}`), {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error('Failed to delete book');
	}

	// Invalidate caches
	booksQueryState.lastUpdated = 0;
	genresQueryState.lastUpdated = 0;

	return true;
}
