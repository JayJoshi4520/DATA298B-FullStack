import { Firestore } from '@google-cloud/firestore';
import path from 'path';

let firestoreInstance = null;

export function getFirestore() {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  try {
    console.log('Initializing Firestore...');
    // Assumes GOOGLE_APPLICATION_CREDENTIALS is set or running in an environment with default credentials
    firestoreInstance = new Firestore({
      ignoreUndefinedProperties: true
    });

    // Attempt to log the project ID to verify connection details
    firestoreInstance.listCollections().then(() => {
      console.log(`✅ Firestore connected. Project ID: ${firestoreInstance.projectId}`);
    }).catch(err => {
      console.error(`❌ Firestore connection check failed: ${err.message}`);
    });

    return firestoreInstance;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    throw error;
  }
}

export default getFirestore;
