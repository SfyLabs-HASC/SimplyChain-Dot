// Script per configurare i dati di test
// Esegui questo script per creare l'azienda di test e l'admin

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupTestData() {
  try {
    console.log('Setting up test data...');

    // Crea l'admin
    const adminEmail = 'sfy.startup@gmail.com';
    const adminPassword = '1234';
    
    try {
      const adminUser = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('Admin user created:', adminUser.user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('Admin user already exists');
      } else {
        throw error;
      }
    }

    // Crea l'azienda di test
    const testCompanyEmail = 'pianopkeys@gmail.com';
    const testCompanyPassword = '1234';
    
    try {
      const testUser = await createUserWithEmailAndPassword(auth, testCompanyEmail, testCompanyPassword);
      
      // Crea il documento azienda
      const companyData = {
        id: testUser.user.uid,
        email: testCompanyEmail,
        nome: 'Piano Keys',
        settore: 'musica',
        isActive: true,
        pending: false,
        crediti: 100,
        createdAt: new Date(),
        activatedAt: new Date()
      };
      
      await setDoc(doc(db, 'companies', testUser.user.uid), companyData);
      console.log('Test company created:', testUser.user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('Test company user already exists');
      } else {
        throw error;
      }
    }

    console.log('Test data setup completed successfully!');
    console.log('Admin credentials: sfy.startup@gmail.com / 1234');
    console.log('Test company credentials: pianopkeys@gmail.com / 1234');
    
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
}

setupTestData();