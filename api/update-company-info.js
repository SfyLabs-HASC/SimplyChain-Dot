import admin from 'firebase-admin';

const ensureFirebase = () => {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return res.end();
  }

  try {
    const { walletAddress, nome, email } = req.body;

    if (!walletAddress || !nome || !email) {
      return res.status(400).json({ error: 'Wallet address, nome, and email are required.' });
    }

    const db = ensureFirebase();
    const normalizedAddress = walletAddress.toLowerCase();
    const activeDocRef = db.collection('active company').doc(normalizedAddress);

    // Check if company exists
    const activeDoc = await activeDocRef.get();
    if (!activeDoc.exists) {
      return res.status(404).json({ error: 'Active company not found.' });
    }

    // Update company info
    await activeDocRef.update({
      nome: nome.trim(),
      email: email.trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: 'Company information updated successfully.' });

  } catch (e) {
    console.error('update-company-info error', e);
    res.status(500).json({ error: 'Internal server error.' });
  }
}