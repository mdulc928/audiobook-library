import type { FirestoreDataConverter } from 'firebase-admin/firestore';

export const permissions = 'permissions';

export type Permission = {
	id: string;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	/** The user id that created the permission. */
	createdBy: string;
	/** The user id that updated the permission. */
	updatedBy: string;
};

export const permissionConverter: FirestoreDataConverter<Permission> = {
	toFirestore: (permission: Permission) => permission,
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
