import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

async function testConnection() {
  try {
    // Attempt to read a meta document to check connectivity
    await getDocFromServer(doc(db, 'meta', 'connection'));
  } catch (error: any) {
    if (error.message?.includes('client is offline')) {
      console.warn("Firestore client is offline. Check your network or Firebase configuration.");
    }
  }
}

testConnection();
