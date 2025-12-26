import { json } from '@sveltejs/kit';
import { db } from '$lib/server/firebase';

const collectionName = 'genres';

export async function POST({ request }) {
	try {
		const genreData = await request.json();
		// we should sanitize before saving.
		const docRef = await db.collection(collectionName).add(genreData);
		return json({ id: docRef.id, ...genreData });
	} catch (error) {
		console.error('Error creating genre:', error);
		return json({ error: 'Failed to create genre' }, { status: 500 });
	}
}

export async function GET() {
	try {
		const snapshot = await db.collection(collectionName).get();
		const genres = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		return json(genres);
	} catch (error) {
		console.error('Error fetching genres:', error);
		return json({ error: 'Failed to fetch genres' }, { status: 500 });
	}
}
