import { json } from '@sveltejs/kit';
import { storage } from '$lib/server/firebase';
import type { RequestHandler } from './$types';

/**
 * Generate a signed URL for a file in Firebase Storage
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { path } = await request.json();

		if (!path || typeof path !== 'string') {
			return json({ error: 'Invalid path provided' }, { status: 400 });
		}

		// Get the bucket
		const bucket = storage.bucket();
		const file = bucket.file(path);

		// Check if file exists
		const [exists] = await file.exists();
		if (!exists) {
			return json({ error: 'File not found' }, { status: 404 });
		}

		// Generate a signed URL that expires in 7 days
		const [url] = await file.getSignedUrl({
			action: 'read',
			expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
		});

		return json({ url });
	} catch (error) {
		console.error('Error getting download URL:', error);
		return json({ error: 'Failed to get download URL' }, { status: 500 });
	}
};
