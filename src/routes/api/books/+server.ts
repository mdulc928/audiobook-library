import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

const collectionName = 'books';

export async function POST({ request }) {
	try {
		const bookData = await request.json();

		// Handle genres: Check if they exist, create if not, and store IDs
		if (bookData.genres && Array.isArray(bookData.genres)) {
			const genreIds: string[] = [];
			const genreCollection = db.collection('genres');

			for (const genreName of bookData.genres) {
				if (typeof genreName === 'string') {
					// Check if genre exists by name
					const genreSnapshot = await genreCollection.where('name', '==', genreName).limit(1).get();

					if (!genreSnapshot.empty) {
						genreIds.push(genreSnapshot.docs[0].id);
					} else {
						// Create new genre
						const newGenreRef = await genreCollection.add({ name: genreName });
						genreIds.push(newGenreRef.id);
					}
				}
			}
			bookData.genres = genreIds;
		}

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
