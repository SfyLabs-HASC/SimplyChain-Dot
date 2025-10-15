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
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return res.end();
  }

  try {
    const db = ensureFirebase();
    
    // Get pending companies
    const pendingSnapshot = await db.collection('pending company').get();
    const pendingCompanies = [];
    
    pendingSnapshot.forEach(doc => {
      const data = doc.data();
      pendingCompanies.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null
      });
    });

    // Get active companies
    const activeSnapshot = await db.collection('active company').get();
    const activeCompanies = [];
    
    activeSnapshot.forEach(doc => {
      const data = doc.data();
      activeCompanies.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null
      });
    });

    // Sort by creation date (newest first)
    pendingCompanies.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    activeCompanies.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    res.status(200).json({
      pending: pendingCompanies,
      active: activeCompanies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
}