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
  try {
    const walletAddress = (req.query.walletAddress || '').toLowerCase();
    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress mancante' });
    }
    
    const db = ensureFirebase();
    
    // Check only active company
    const activeSnap = await db.collection('active company').doc(walletAddress).get();
    
    if (activeSnap.exists) {
      const activeData = activeSnap.data();
      return res.status(200).json({ 
        pending: false, 
        isActive: true, 
        company: {
          nome: activeData.nome,
          email: activeData.email,
          settore: activeData.settore,
          crediti: activeData.crediti || 0,
          walletAddress: activeData.walletAddress,
          activatedAt: activeData.activatedAt
        }
      });
    }
    // If not active, check pending request
    const pendingSnap = await db.collection('pending company').doc(walletAddress).get();
    if (pendingSnap.exists) {
      const p = pendingSnap.data();
      return res.status(200).json({
        pending: true,
        isActive: false,
        company: {
          nome: p.nome,
          email: p.email,
          settore: p.settore,
          walletAddress: p.walletAddress,
          createdAt: p.createdAt,
        }
      });
    }

    // Neither active nor pending found
    return res.status(200).json({ pending: false, isActive: false, company: null });
    
  } catch (e) {
    console.error('get-company-status error', e);
    return res.status(500).json({ error: 'Errore server' });
  }
}

