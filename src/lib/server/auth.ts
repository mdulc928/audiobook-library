import { getAppAuth } from './firebase';

export async function decodeToken(headers: Headers) {
	const auth = getAppAuth();
	const authHeader = headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.split('Bearer ')[1];
		return auth.verifyIdToken(token);
	}
}
