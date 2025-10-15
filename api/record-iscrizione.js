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
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return res.end();
  }

  try {
    const {
      walletAddress,
      iscrizione, // { nome, descrizione, data, luogo, hashDocumento, steps: [] }
      txHash,
    } = req.body || {};

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress mancante' });
    }
    if (!iscrizione || typeof iscrizione !== 'object') {
      return res.status(400).json({ error: 'iscrizione mancante o non valida' });
    }

    console.log('record-iscrizione: Starting for wallet', walletAddress, 'txHash', txHash);
    const db = ensureFirebase();
    console.log('record-iscrizione: Firebase initialized');
    const normalizedAddress = String(walletAddress).toLowerCase();

    const activeRef = db.collection('active company').doc(normalizedAddress);
    const iscrizioniRoot = db.collection('DATI ISCRIZIONI').doc(normalizedAddress).collection('items');

    await db.runTransaction(async (t) => {
      // READS FIRST
      const [activeSnap, numSnap] = await Promise.all([
        t.get(activeRef),
        t.get(db.collection('NUMERO ISCRIZIONI').doc(normalizedAddress))
      ]);

      if (!activeSnap.exists) {
        throw new Error('Azienda non trovata in active company');
      }

      const activeData = activeSnap.data();
      const currentCrediti = Number(activeData.crediti || 0);
      if (currentCrediti <= 0) {
        throw new Error('Crediti insufficienti');
      }

      const numRef = db.collection('NUMERO ISCRIZIONI').doc(normalizedAddress);
      const currentNum = numSnap.exists ? Number(numSnap.data()?.count || 0) : 0;

      // PREP WRITE REFS
      const newDocRef = iscrizione?.batchId
        ? iscrizioniRoot.doc(String(iscrizione.batchId))
        : iscrizioniRoot.doc();

      // WRITES AFTER ALL READS
      t.update(activeRef, {
        crediti: currentCrediti - 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      t.set(newDocRef, {
        ...iscrizione,
        txHash: txHash || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (txHash) {
        const txHashRef = db.collection('TXHASH').doc(txHash);
        t.set(txHashRef, {
          walletAddress: normalizedAddress,
          batchId: iscrizione?.batchId || newDocRef.id,
          txHash: txHash,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      t.set(numRef, { count: currentNum + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    });

    res.status(200).json({ message: 'Iscrizione registrata e credito scalato.' });
  } catch (e) {
    console.error('record-iscrizione error', e);
    res.status(500).json({ error: e?.message || 'Errore server' });
  }
}

