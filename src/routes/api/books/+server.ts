import { json } from '@sveltejs/kit';
import { getAppFirestore } from '$lib/server/firebase';

const collectionName = 'books';

export async function POST({ request }) {
	try {
		const db = getAppFirestore();
		const bookData = await request.json();

		// Handle genres: Check if they exist, create if not, and store IDs
		if (bookData.genres && Array.isArray(bookData.genres)) {
			const genreIds: string[] = [];
			const genreCollection = db.collection('genres');

			for (const genreInput of bookData.genres) {
				if (typeof genreInput === 'string') {
					// 1. Try to fetch by ID first
					const genreDoc = await genreCollection.doc(genreInput).get();
					if (genreDoc.exists) {
						genreIds.push(genreDoc.id);
					} else {
						// 2. Fetch by name or create
						// Check localized name (en) first
						let snapshot = await genreCollection.where('name.en', '==', genreInput).limit(1).get();

						if (snapshot.empty) {
							// Try legacy name
							snapshot = await genreCollection.where('name', '==', genreInput).limit(1).get();
						}

						if (!snapshot.empty) {
							genreIds.push(snapshot.docs[0].id);
						} else {
							// Create new genre with localized structure
							const newGenreRef = await genreCollection.add({ name: { en: genreInput } });
							genreIds.push(newGenreRef.id);
						}
					}
				}
			}
			bookData.genres = genreIds;
		}

		// we should sanitize before saving.
		const bookId = bookData.id;
		if (bookId) {
			await db.collection(collectionName).doc(bookId).set(bookData);
			return json({ id: bookId, ...bookData });
		} else {
			const docRef = await db.collection(collectionName).add(bookData);
			return json({ id: docRef.id, ...bookData });
		}
	} catch (error) {
		console.error('Error creating book:', error);
		return json({ error: 'Failed to create book' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const db = getAppFirestore();
		const snapshot = await db.collection(collectionName).get();
		const books = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
		return json(books);
	} catch (error) {
		console.error('Error fetching books:', error);
		return json({ error: 'Failed to fetch books' }, { status: 500 });
	}
}
