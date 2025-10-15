import admin from 'firebase-admin';

const ensureFirebase = () => {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase env vars mancanti');
    }
    admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
  }
  return admin.firestore();
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return res.end();
  }
  
  try {
    const { wallet } = req.query;
    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required' });
    }
    
    const db = ensureFirebase();
    const walletLower = String(wallet).toLowerCase();
    
    // Get notarization txHashes from NOTARIZZAZIONE collection
    const notarizzazioniRef = db.collection('NOTARIZZAZIONE');
    const snapshot = await notarizzazioniRef
      .where('walletAddress', '==', walletLower)
      .get();
    
    const txHashes = [];
    console.log('📄 Found', snapshot.size, 'notarization documents');
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('📄 Document data:', { id: doc.id, walletAddress: data.walletAddress, txHash: data.txHash, hash: data.hash, batchId: data.batchId });
      
      if (data.txHash) {
        // Usa l'hash del documento come chiave principale, fallback al batchId
        const key = data.hash || data.batchId;
        if (key) {
          txHashes.push({
            batchId: String(data.batchId || ''),
            txHash: String(data.txHash),
            nome: String(data.nome || ''),
            hash: String(data.hash || ''),
            createdAt: data.createdAt?.toDate?.() || null
          });
        }
      }
    });
    
    // Sort by createdAt descending
    txHashes.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    console.log('📄 Returning', txHashes.length, 'txHashes');
    return res.status(200).json({ txHashes });
  } catch (error) {
    console.error('Error getting notarization txHashes:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}