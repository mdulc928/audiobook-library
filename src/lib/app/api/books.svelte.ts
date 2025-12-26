import { Book } from '$lib/app/concepts/Book/Book.svelte';
import { bookResponseSchema, booksResponseSchema } from '$lib/app/concepts/Book/Book.schema';
import { resolve } from '$app/paths';
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

	// Cast to unknown first to satisfy TypeScript, as Zod validates the structure at runtime
	booksQueryState.data = validatedData.map((d) => new Book(d));
	booksQueryState.isPending = false;
	booksQueryState.isError = false;
	booksQueryState.lastUpdated = Date.now();
	booksQueryState.staleTime = 60 * 60 * 1000; // 1 hour

	return booksQueryState;
}
