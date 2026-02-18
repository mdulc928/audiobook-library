import { PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_STORAGE_BUCKET } from '$env/static/public';
import { initializeApp, getApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let app: App;
let db: Firestore;
let storage: Storage;
let auth: Auth;

function initializeFirebase() {
	try {
		app = getApp();
	} catch (e) {
		app = initializeApp({
			projectId: PUBLIC_FIREBASE_PROJECT_ID,
			storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET
		});
		console.log('Firebase app already initialized', e);
	}
}

export function getAppFirestore() {
	if (!app) {
		initializeFirebase();
	}
	if (!db) {
		db = getFirestore(app);
	}
	return db;
}

export function getAppStorage() {
	if (!app) {
		initializeFirebase();
	}
	if (!storage) {
		storage = getStorage(app);
	}
	return storage;
}

export function getAppAuth() {
	if (!app) {
		initializeFirebase();
	}
	if (!auth) {
		auth = getAuth(app);
	}
	return auth;
}

initializeFirebase();
