import { Book } from '$lib/app/concepts/Book/Book.svelte';
import { bookResponseSchema, booksResponseSchema } from '$lib/app/concepts/Book/Book.schema';
import { resolve } from '$app/paths';

const booksQueryState = $state<{
	data: Book[] | undefined;
	/** True if the query is actively fetching. */
	isPending: boolean;
	/** True if the query failed. */
	isError: boolean;
	/** Timestamp of the last update. */
	lastUpdated: number;
	/** Number of milliseconds before the data is considered stale */
	staleTime: number;
}>({
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
