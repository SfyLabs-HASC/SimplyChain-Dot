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
    const { wallet } = req.query || {};
    if (!wallet) return res.status(400).json({ error: 'wallet mancante' });
    const db = ensureFirebase();
    const snap = await db.collection('NOTARIZZAZIONE').where('walletAddress', '==', String(wallet).toLowerCase()).get();
    const items = [];
    snap.forEach(doc => {
      const d = doc.data();
      items.push({ id: doc.id, nome: d.nome, hash: d.hash, batchId: d.batchId || null, txHash: d.txHash || null, createdAt: d.createdAt?.toDate?.() || null });
    });
    items.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    res.status(200).json({ items });
  } catch (e) {
    console.error('get-notarizzazioni error', e);
    res.status(500).json({ error: e?.message || 'Errore server' });
  }
}

