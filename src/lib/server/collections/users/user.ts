import type { FirestoreDataConverter } from 'firebase-admin/firestore';

export const users = 'users';

type User = {
	id: string;
	name: string;
	email: string;
	phone: string;
	createdAt: Date;
	updatedAt: Date;
};

export const userConverter: FirestoreDataConverter<User> = {
	toFirestore: (user: User) => user,
	fromFirestore: (snapshot) => {
		const data = snapshot.data();
		if (!data) {
			throw new Error('No data found!');
		}
		return {
			id: snapshot.id,
			name: data.name,
			email: data.email,
			phone: data.phone,
			createdAt: data.createdAt.toDate(),
			updatedAt: data.updatedAt.toDate()
		};
	}
};

/** The state of the  */
export const userProgress = 'progress';

/** The idea is that each audio can be played separately. So that each thing's progress can be tracked separately. */
export type UserProgress = {
	id: string; // this is the id of the record.
	userId: string;
	assetId: string; // the id of the thing that the user is viewing.
	progress: number;
	createdAt: Date;
	updatedAt: Date;
};
