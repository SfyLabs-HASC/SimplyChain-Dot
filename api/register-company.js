import { Resend } from 'resend';
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
    const body = req.body || {};
    const { walletAddress, nome, email, settore, settoreAltro, sitoWeb, linkedin, facebook, instagram, twitter, tiktok } = body;

    const db = ensureFirebase();
    const docRef = db.collection('pending company').doc((walletAddress || '').toLowerCase());
    await docRef.set({
      walletAddress: (walletAddress || '').toLowerCase(),
      nome,
      email,
      settore: settore === 'Altro' ? (settoreAltro || 'Altro') : settore,
      sitoWeb,
      linkedin,
      facebook,
      instagram,
      twitter,
      tiktok,
      pending: true,
      isActive: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const to = 'sfy.startup@gmail.com';
      const subject = `${nome} + Richiesta di iscrizione`;
      const settoreFinale = settore === 'Altro' ? (settoreAltro || 'Altro') : settore;
      const html = `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;margin:0">
          <tr>
            <td align="center">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="background:#ffffff;border-radius:16px;box-shadow:0 10px 25px rgba(2,6,23,0.08);overflow:hidden">
                <tr>
                  <td style="background:#4f46e5;padding:20px 24px">
                    <h1 style="margin:0;font:600 20px/1.2 system-ui,Segoe UI,Roboto,Arial;color:#ffffff">SimplyChain</h1>
                    <div style="margin-top:4px;color:#e0e7ff;font:500 13px/1.6 system-ui">Nuova richiesta di iscrizione</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px">
                    <p style="margin:0 0 14px 0;font:400 14px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">Dettagli del richiedente:</p>
                    <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                      <div style="background:#ecfeff;padding:10px 14px;color:#0e7490;font:600 13px/1.6 system-ui">Dati azienda</div>
                      <div style="padding:12px 14px;background:#ffffff">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                          <tr><td style="padding:4px 0;width:40%"><strong>Nome</strong></td><td style="padding:4px 0;color:#334155">${nome || '-'}</td></tr>
                          <tr><td style="padding:4px 0"><strong>Email</strong></td><td style="padding:4px 0;color:#334155">${email || '-'}</td></tr>
                          <tr><td style="padding:4px 0"><strong>Settore</strong></td><td style="padding:4px 0;color:#334155">${settoreFinale || '-'}</td></tr>
                          <tr><td style="padding:4px 0"><strong>Wallet</strong></td><td style="padding:4px 0;color:#334155">${(walletAddress || '').toLowerCase()}</td></tr>
                          <tr><td style="padding:4px 0"><strong>Sito Web</strong></td><td style="padding:4px 0;color:#334155">${sitoWeb || '-'}</td></tr>
                        </table>
                      </div>
                    </div>
                    <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                      <div style="background:#fff7ed;padding:10px 14px;color:#9a3412;font:600 13px/1.6 system-ui">Profili social</div>
                      <div style="padding:12px 14px;background:#ffffff">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                          <tr><td style="padding:4px 0;width:40%"><strong>LinkedIn</strong></td><td style="padding:4px 0;color:#334155">${linkedin || '-'}</td></tr>
                          <tr><td style="padding:4px 0"><strong>Facebook</strong></td><td style="padding:4px 0;color:#334155">${facebook || '-'}</td></tr>
                          <tr><td style="padding:4px 0"><strong>Instagram</strong></td><td style="padding:4px 0;color:#334155">${instagram || '-'}</td></tr>
                          <tr><td style="padding:4px 0"><strong>Twitter/X</strong></td><td style="padding:4px 0;color:#334155">${twitter || '-'}</td></tr>
                          <tr><td style="padding:4px 0"><strong>TikTok</strong></td><td style="padding:4px 0;color:#334155">${tiktok || '-'}</td></tr>
                        </table>
                      </div>
                    </div>
                    <p style="margin:18px 0 0 0;font:400 12px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#475569">Richiesta inviata tramite <strong style="color:#4f46e5">SimplyChain</strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:14px 24px;text-align:center;color:#64748b;font:500 12px/1.7 system-ui">© ${new Date().getFullYear()} SimplyChain</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
      await resend.emails.send({
        from: process.env.MAIL_FROM || 'SimplyChain <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      // Send confirmation email to the user with same brand styling
      if (email) {
        const userHtml = `
          <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\" style=\"background:#f1f5f9;padding:24px 0;margin:0\">\n            <tr>\n              <td align=\"center\">\n                <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"640\" style=\"background:#ffffff;border-radius:16px;box-shadow:0 10px 25px rgba(2,6,23,0.08);overflow:hidden\">\n                  <tr>\n                    <td style=\"background:#4f46e5;padding:20px 24px\">\n                      <h1 style=\"margin:0;font:600 20px/1.2 system-ui,Segoe UI,Roboto,Arial;color:#ffffff\">SimplyChain</h1>\n                      <div style=\"margin-top:4px;color:#e0e7ff;font:500 13px/1.6 system-ui\">Richiesta ricevuta</div>\n                    </td>\n                  </tr>\n                  <tr>\n                    <td style=\"padding:24px\">\n                      <h2 style=\"margin:0 0 12px 0;font:700 18px/1.4 system-ui,Segoe UI,Roboto,Arial;color:#0f172a\">SimplyChain - Richiesta ricevuta</h2>\n                      <p style=\"margin:0 0 14px 0;font:400 14px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a\">Abbiamo ricevuto la tua richiesta di iscrizione! Un amministratore la verificherà al più presto e, se tutti i requisiti sono rispettati, il tuo account verrà attivato.</p>\n                      <div style=\"margin-top:18px\">\n                        <a href=\"https://simplychain.it\" style=\"display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font:600 14px/1 system-ui,Segoe UI,Roboto,Arial\">Visita il sito</a>\n                      </div>\n                      <p style=\"margin:18px 0 0 0;font:400 12px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#475569\">SimplyChain</p>\n                    </td>\n                  </tr>\n                  <tr>\n                    <td style=\"background:#f8fafc;padding:14px 24px;text-align:center;color:#64748b;font:500 12px/1.7 system-ui\">© ${new Date().getFullYear()} SimplyChain</td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n          </table>`;
        await resend.emails.send({
          from: process.env.MAIL_FROM || 'SimplyChain <onboarding@resend.dev>',
          to: email,
          subject: 'SimplyChain - Richiesta ricevuta',
          html: userHtml,
        });
      }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('register-company error', e);
    res.status(500).send('Errore server');
  }
}

