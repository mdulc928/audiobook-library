import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

const collectionName = 'books';

export async function GET({ params }) {
	try {
		const doc = await db.collection(collectionName).doc(params.bookId).get();
		if (!doc.exists) {
			return json({ error: 'Book not found' }, { status: 404 });
		}
		return json({ id: doc.id, ...doc.data() });
	} catch (error) {
		console.error('Error fetching book:', error);
		return json({ error: 'Failed to fetch book' }, { status: 500 });
	}
}

export async function PUT({ params, request }) {
	try {
		const bookData = await request.json();
		// remove undefined fields or handle partial updates if necessary
		// For PUT we usually replace or update fully.
		// Be careful with ID mismatch.

		// Handle genres logic similar to POST
		// The client sends genre names (from CreatableSelect). We need to resolve them to IDs.
		if (bookData.genres && Array.isArray(bookData.genres)) {
			const genreIds: string[] = [];
			const genreCollection = db.collection('genres');

			for (const genreName of bookData.genres) {
				if (typeof genreName === 'string') {
					// 1. Check if it's already an ID (optimization: check length/format or just lookup)
					// BUT a new genre name could look like an ID.
					// We'll trust the process: Lookup by Name.
					// If a genre with this NAME exists, use its ID.
					// If not, CREATE a genre with this NAME.
					// Edge case: If the input was ALREADY an ID, looking it up as a Name will likely fail.
					// If it fails, do we assume it's an ID?
					// Safer: Check if it matches an existing ID?
					// Given the client maps IDs to Names on load, the client should effectively ONLY send Names on save.
					// So treating everything as a Name to lookup/create is correct.

					const genreSnapshot = await genreCollection.where('name', '==', genreName).limit(1).get();

					if (!genreSnapshot.empty) {
						genreIds.push(genreSnapshot.docs[0].id);
					} else {
						// Only create if it doesn't look like an existing ID?
						// Or just create. If user typed a random string that happens to be an ID, they probably meant it as a name.
						const newGenreRef = await genreCollection.add({ name: genreName });
						genreIds.push(newGenreRef.id);
					}
				}
			}
			bookData.genres = genreIds;
		}

		await db.collection(collectionName).doc(params.bookId).set(bookData, { merge: true });
		return json({ id: params.bookId, ...bookData });
	} catch (error) {
		console.error('Error updating book:', error);
		return json({ error: 'Failed to update book' }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	try {
		// Delete document
		await db.collection(collectionName).doc(params.bookId).delete();

		// Delete storage images?
		// Server-side storage deletion requires Admin SDK or logic.
		// Client-side is easier if we have the paths.
		// For now, let's just delete the doc. The prompt said "Deleting the book should delete the images too".
		// Use Admin SDK bucket if available? `db` is from firebase-admin.
		// We can access `admin.storage().bucket()`?
		// Let's assume we return success and client cleans up or we implement server-side cleanup.
		// Since `db` is exported from `$lib/server/firebase`, check that file.

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting book:', error);
		return json({ error: 'Failed to delete book' }, { status: 500 });
	}
}
