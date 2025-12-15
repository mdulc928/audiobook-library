import { type FirebaseApp, initializeApp } from 'firebase/app';
import { type Analytics, getAnalytics } from 'firebase/analytics';
import { Firestore, initializeFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';
import { type Auth, getAuth } from 'firebase/auth';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_APP_ID,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_MEASUREMENT_ID,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET
} from '$env/static/public';
import { browser } from '$app/environment';

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID,
	measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app = $state<FirebaseApp>();
let analytics = $state<Analytics>();
let db = $state<Firestore>();
let auth = $state<Auth>();
let storage = $state<FirebaseStorage>();

export function initFirebase() {
	if (!browser) return;

	app = initializeApp(firebaseConfig);
	if (!app) return;

	db = initializeFirestore(app, { ignoreUndefinedProperties: true });
	auth = getAuth(app);
	storage = getStorage(app);
	analytics = getAnalytics(app);
}

export function getFirebaseApp() {
	return app;
}
export function getAppStorage() {
	return storage;
}
export function getAppAuth() {
	return auth;
}

export function getAppFirestore() {
	return db;
}
/* if (auth && dev) {
	connectAuthEmulator(
		auth,
		`http://${PUBLIC_FIREBASE_EMULATORS_HOST}:${PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT}`
	);
} */

/* if (storage && dev) {
	connectStorageEmulator(
		storage,
		PUBLIC_FIREBASE_EMULATORS_HOST,
		parseInt(PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT)
	);
} */
