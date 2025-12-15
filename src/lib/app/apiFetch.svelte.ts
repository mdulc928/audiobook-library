import { Book } from '$lib/app/concepts/Book/Book.svelte';

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

	return response.json();
}

export async function getBooks(): Promise<Book[]> {
	const response = await fetch('/api/books');
	if (!response.ok) {
		throw new Error('Failed to fetch books');
	}
	const data = await response.json();
	return data.map((d: any) => new Book(d));
}
