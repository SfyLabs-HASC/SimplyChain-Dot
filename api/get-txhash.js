import admin from 'firebase-admin';

const ensureFirebase = () => {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase env vars mancanti: controlla FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    }
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
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
    const { wallet } = req.query || {};
    if (!wallet) {
      return res.status(400).json({ error: 'wallet mancante' });
    }

    console.log('get-txhash: Starting for wallet', wallet);
    const db = ensureFirebase();
    console.log('get-txhash: Firebase initialized');
    const normalizedAddress = String(wallet).toLowerCase();

    // Recupera tutte le txHash per questo wallet dalla raccolta TXHASH
    console.log('get-txhash: Querying TXHASH collection for', normalizedAddress);
    const txHashSnapshot = await db.collection('TXHASH')
      .where('walletAddress', '==', normalizedAddress)
      .get();

    console.log('get-txhash: Found', txHashSnapshot.size, 'documents');
    const txHashes = [];
    txHashSnapshot.forEach(doc => {
      const data = doc.data();
      txHashes.push({
        id: doc.id,
        walletAddress: data.walletAddress,
        batchId: data.batchId,
        txHash: data.txHash,
        createdAt: data.createdAt?.toDate?.() || null,
      });
    });

    // Sort in-memory by createdAt desc (avoids composite index requirement)
    txHashes.sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.getTime() : 0;
      const tb = b.createdAt ? b.createdAt.getTime() : 0;
      return tb - ta;
    });

    console.log('get-txhash: Returning', txHashes.length, 'txHashes');
    res.status(200).json({ txHashes });
  } catch (e) {
    console.error('get-txhash error', e);
    res.status(500).json({ error: e?.message || 'Errore server' });
  }
}