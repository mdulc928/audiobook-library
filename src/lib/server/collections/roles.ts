import type { FirestoreDataConverter } from 'firebase-admin/firestore';

export const roles = 'roles';

export interface Role {
	id: string;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	/** The user id that created the role. */
	createdBy: string;
	/** The user id that updated the role. */
	updatedBy: string;
}

export const roleConverter: FirestoreDataConverter<Role> = {
	toFirestore: (role: Role) => role,
	fromFirestore: (snapshot) => {
		const data = snapshot.data();
		if (!data) {
			throw new Error('No data found!');
		}
		return {
			id: snapshot.id,
			name: data.name,
			description: data.description,
			createdAt: data.createdAt.toDate(),
			updatedAt: data.updatedAt.toDate(),
			createdBy: data.createdBy,
			updatedBy: data.updatedBy
		};
	}
};
