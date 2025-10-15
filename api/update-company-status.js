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
    const { walletAddress, action, crediti } = req.body;
    
    if (!walletAddress || !action) {
      return res.status(400).json({ error: 'Wallet address and action are required' });
    }

    const db = ensureFirebase();
    const normalizedAddress = walletAddress.toLowerCase();

    if (action === 'activate') {
      // Move from pending to active
      const pendingDoc = await db.collection('pending company').doc(normalizedAddress).get();
      
      if (!pendingDoc.exists) {
        return res.status(404).json({ error: 'Company not found in pending list' });
      }

      const companyData = pendingDoc.data();
      
      // Add to active company with crediti
      await db.collection('active company').doc(normalizedAddress).set({
        ...companyData,
        isActive: true,
        pending: false,
        crediti: crediti || 0,
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        activatedBy: 'admin' // You can add user info here later
      });

      // Remove from pending
      await db.collection('pending company').doc(normalizedAddress).delete();

      res.status(200).json({ message: 'Company activated successfully' });

    } else if (action === 'deactivate') {
      // Move from active to pending
      const activeDoc = await db.collection('active company').doc(normalizedAddress).get();
      
      if (!activeDoc.exists) {
        return res.status(404).json({ error: 'Company not found in active list' });
      }

      const companyData = activeDoc.data();
      
      // Add to pending company
      await db.collection('pending company').doc(normalizedAddress).set({
        ...companyData,
        isActive: false,
        pending: true,
        deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deactivatedBy: 'admin'
      });

      // Remove from active
      await db.collection('active company').doc(normalizedAddress).delete();

      res.status(200).json({ message: 'Company deactivated successfully' });

    } else if (action === 'update-crediti') {
      // Update crediti for active company
      if (crediti === undefined || crediti === null) {
        return res.status(400).json({ error: 'Crediti amount is required' });
      }

      const activeDoc = await db.collection('active company').doc(normalizedAddress).get();
      
      if (!activeDoc.exists) {
        return res.status(404).json({ error: 'Company not found in active list' });
      }

      await db.collection('active company').doc(normalizedAddress).update({
        crediti: parseInt(crediti),
        creditiUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        creditiUpdatedBy: 'admin'
      });

      res.status(200).json({ message: 'Crediti updated successfully' });

    } else if (action === 'delete') {
      // Delete from pending companies
      const pendingDoc = await db.collection('pending company').doc(normalizedAddress).get();
      
      if (!pendingDoc.exists) {
        return res.status(404).json({ error: 'Company not found in pending list' });
      }

      await db.collection('pending company').doc(normalizedAddress).delete();

      res.status(200).json({ message: 'Company request deleted successfully' });

    } else {
      res.status(400).json({ error: 'Invalid action. Use: activate, deactivate, update-crediti, or delete' });
    }

  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({ error: 'Failed to update company status' });
  }
}