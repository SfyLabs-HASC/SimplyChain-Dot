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
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return res.end();
  }
  try {
    const { walletAddress, nome, hash, batchId: providedBatchId, txHash: providedTxHash } = req.body || {};
    if (!walletAddress || !hash || !nome) {
      return res.status(400).json({ error: 'Parametri mancanti' });
    }
    const db = ensureFirebase();

    // Fast path: if client already did on-chain and provides batchId + txHash, save + decrement credit atomically
    if (providedBatchId && providedTxHash) {
      try {
        const wallet = String(walletAddress).toLowerCase();
        const activeRef = db.collection('active company').doc(wallet);
        const notaColl = db.collection('NOTARIZZAZIONE');
        const result = await db.runTransaction(async (t) => {
          // Reads first
          const activeSnap = await t.get(activeRef);
          if (!activeSnap.exists) {
            throw new Error('Azienda attiva non trovata');
          }
          const data = activeSnap.data() || {};
          const crediti = Number(data.crediti ?? 0);
          if (!Number.isFinite(crediti) || crediti <= 0) {
            throw new Error('Crediti insufficienti');
          }
          // Writes
          t.update(activeRef, { crediti: crediti - 1 });
          const docRef = notaColl.doc();
          t.set(docRef, {
            walletAddress: wallet,
            nome: String(nome),
            hash: String(hash),
            batchId: String(providedBatchId),
            txHash: String(providedTxHash),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return { id: docRef.id, newCrediti: crediti - 1 };
        });
        return res.status(200).json({ id: result.id, txHash: providedTxHash, batchId: String(providedBatchId), newCrediti: result.newCrediti });
      } catch (err) {
        console.error('notarizza: save-only branch failed', err);
        return res.status(500).json({ error: err?.message || 'Salvataggio notarizzazione fallito' });
      }
    }

    const secret = process.env.THIRDWEB_SECRET_KEY || process.env.INSIGHT_API_KEY || '';
    if (!secret) {
      console.error('notarizza: Missing THIRDWEB_SECRET_KEY/INSIGHT_API_KEY');
      return res.status(500).json({ error: 'Configurazione mancante: THIRDWEB_SECRET_KEY' });
    }

    // 1) Crea batch vuoto on-chain via Thirdweb API write
    const body = {
      calls: [
        {
          contractAddress: '0x71efb9364a896973b80786541c3a431bcf6c7efa',
          method: 'function creaBatch(string _nome, string _descrizione, string _data, string _luogo, string _hashDocumento, (string nome, string descrizione, string data, string luogo, string hashDocumento)[] _steps)',
          params: ['', '', '', '', '', []],
        },
      ],
      chainId: 42161,
      from: walletAddress,
    };
    const writeResp = await fetch('https://api.thirdweb.com/v1/contracts/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-secret-key': secret },
      body: JSON.stringify(body),
    });
    const writeJson = await writeResp.json();
    if (!writeResp.ok) {
      console.error('notarizza: creaBatch failed', writeJson);
      return res.status(500).json({ error: 'Write API creaBatch fallita', detail: writeJson });
    }
    const createTxHash = writeJson?.result?.transactionHash || writeJson?.transactionHash || '';

    // 2) Recupera ultimo batchId per wallet leggendo on-chain (viem + RPC)
    let batchId = writeJson?.result?.batchId || null;
    try {
      // Lazy import to keep cold start small
      const { createPublicClient, http } = await import('viem');
      const { arbitrum } = await import('viem/chains');
      const publicClient = createPublicClient({ chain: arbitrum, transport: http(process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc') });
      const abi = [
        {
          name: 'getBatchesAzienda',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: '_azienda', type: 'address' }],
          outputs: [{ name: 'ids', type: 'uint256[]' }],
        },
      ];
      // small delay to allow indexing
      await new Promise(r => setTimeout(r, 3000));
      const ids = await publicClient.readContract({
        address: '0x39c968C3a6E021d2AF046EaC8C3D145C8fC1ae3e',
        abi,
        functionName: 'getBatchesAzienda',
        args: [walletAddress],
      });
      if (Array.isArray(ids) && ids.length > 0) {
        const last = ids[ids.length - 1];
        batchId = String(last);
      }
    } catch (e) {
      console.error('notarizza: failed to fetch batchId via read', e);
    }

    // 3) Notarizza on-chain con notarizzaBatch
    if (batchId == null) {
      console.error('notarizza: batchId is null, cannot notarize');
      return res.status(500).json({ error: 'BatchId non determinato dopo creaBatch' });
    }
    const notarizzaBody = {
      calls: [
        {
          contractAddress: '0x71efb9364a896973b80786541c3a431bcf6c7efa',
          method: 'function notarizzaBatch(uint256,string)',
          params: [batchId, hash],
        },
      ],
      chainId: 42161,
      from: walletAddress,
    };
    const notaResp = await fetch('https://api.thirdweb.com/v1/contracts/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-secret-key': secret },
      body: JSON.stringify(notarizzaBody),
    });
    const notaJson = await notaResp.json();
    if (!notaResp.ok) {
      console.error('notarizza: notarizzaBatch failed', notaJson);
      return res.status(500).json({ error: 'Write API notarizzaBatch fallita', detail: notaJson });
    }
    const txHash = notaJson?.result?.transactionHash || notaJson?.transactionHash || '';

    // 4) Salva su Firestore raccolta NOTARIZZAZIONE
    const coll = db.collection('NOTARIZZAZIONE');
    const doc = await coll.add({
      walletAddress: String(walletAddress).toLowerCase(),
      nome: String(nome),
      hash: String(hash),
      batchId: batchId ? String(batchId) : null,
      txHash: txHash || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ id: doc.id, txHash, createTxHash, batchId });
  } catch (e) {
    console.error('notarizza error', e);
    res.status(500).json({ error: e?.message || 'Errore server' });
  }
}

