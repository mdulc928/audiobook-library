import { Book } from '$lib/app/concepts/Book/Book.svelte';
import { BookResponseSchema, BooksResponseSchema } from '$lib/app/concepts/Book/Book.schema';

export async function createBook(book: Book) {
	const response = await fetch('/api/books', {
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
	const validatedData = BookResponseSchema.parse(data);

	return validatedData;
}

export async function getBooks(): Promise<Book[]> {
	const response = await fetch('/api/books');
	if (!response.ok) {
		throw new Error('Failed to fetch books');
	}

	const data = await response.json();

	// Validate response with Zod
	const validatedData = BooksResponseSchema.parse(data);

	// Cast to unknown first to satisfy TypeScript, as Zod validates the structure at runtime
	return validatedData.map((d) => new Book(d));
}
