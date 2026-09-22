import { Action } from '../index';
import firebase from 'firebase';

import { C } from '../../util/CL';
const CL = C(__filename);
let fb = null;
interface StorageSpec {
	path: string;
	content: any;
	metadata: string;
}
export interface Actions {
	init: Action;
	store: Action<StorageSpec>;
	list: Action<string>;
	upload: Action<StorageSpec>;
	download: Action<string, Promise<URL>>;
}

export const actions: Actions = {
	init({ state, actions }) {
		// CL('start init');
		if (fb) return;
		const firebaseConfig = {
			apiKey: '', // removed 2026-09-22: key leaked and revoked; supply a restricted key at build time
			authDomain: 'mike-wolf.firebaseapp.com',
			ConstantSourceNodeatabaseURL: 'https://mike-wolf.firebaseio.com',
			projectId: 'mike-wolf',
			storageBucket: 'mike-wolf.appspot.com',
			messagingSenderId: '595993744223',
			appId: '1:595993744223:web:9d992db48c10795c0a9cea',
			measurementId: 'G-JN7VTQKP24'
		};
		// Initialize Firebase
		try {
			// CL('Init');
			firebase.initializeApp(firebaseConfig);
		} catch (e) {
			CL('Already initialized', e);
			// firebase.analytics();
		}
		fb = firebase;
	},
	store({ state, actions }, spec: StorageSpec) {
		if (!spec || !spec.path) return;
		// console.clear();

		const ref = firebase.storage().ref(spec.path);
		const message = 'This is my message.';
		ref
			.putString(message)
			.then(function (snapshot) {
				console.log('Uploaded a raw string!');
			})
			.catch((e) => CL('an error storing', e));
		CL('stored');
	},
	upload({ state }, spec: StorageSpec) {
		CL('upload');
		const ref = firebase.storage().ref(spec.path);
		CL('got ref', ref);
		fetch(spec.content)
			.then((r) => r.blob())
			.then((blob) => {
				ref
					.put(blob)
					.then((snapshot) => {
						CL('uploaded');
					})
					.catch((e) => {
						CL('Error uploading: ', e);
					});
			});
	},
	download({ state, actions }, path: string) {
		try {
			const ref = firebase.storage().ref(path);
			return ref.getDownloadURL();
		} catch (e) {
			CL('Error ', e);
		}
	},
	list({ state }, path = '/') {
		const ref = firebase.storage().ref(path);

		ref
			.listAll()
			.then(function (res) {
				res.prefixes.forEach(function (folderRef) {
					CL('Folder', folderRef);
					// All the prefixes under listRef.
					// You may call listAll() recursively on them.
				});
				res.items.forEach(function (itemRef) {
					CL('item', itemRef);
					// All the items under listRef.
				});
			})
			.catch(function (error) {
				CL('List error', error);
				// Uh-oh, an error occurred!
			});
	}
};
export interface State {
	fb: any;
}

export const state: State = {
	fb: null
};
