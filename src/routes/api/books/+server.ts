import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

const collectionName = 'books';

export async function POST({ request }) {
	try {
		const bookData = await request.json();
		// we should sanitize before saving.
		const docRef = await db.collection(collectionName).add(bookData);
		return json({ id: docRef.id, ...bookData });
	} catch (error) {
		console.error('Error creating book:', error);
		return json({ error: 'Failed to create book' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const snapshot = await db.collection(collectionName).get();
		const books = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		return json(books);
	} catch (error) {
		console.error('Error fetching books:', error);
		return json({ error: 'Failed to fetch books' }, { status: 500 });
	}
}
