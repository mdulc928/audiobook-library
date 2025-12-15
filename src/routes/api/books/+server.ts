import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

export async function POST({ request }) {
	try {
		const bookData = await request.json();
		const docRef = await db.collection('books').add(bookData);
		return json({ id: docRef.id, ...bookData });
	} catch (error) {
		console.error('Error creating book:', error);
		return json({ error: 'Failed to create book' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const snapshot = await db.collection('books').get();
		const books = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		return json(books);
	} catch (error) {
		console.error('Error fetching books:', error);
		return json({ error: 'Failed to fetch books' }, { status: 500 });
	}
}
