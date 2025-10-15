import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return res.end();
  }

  try {
    const { nome, email, azienda, messaggio } = req.body || {};
    
    if (!nome || !email || !messaggio) {
      return res.status(400).json({ error: 'Parametri mancanti (nome, email, messaggio)' });
    }

    const apiKey = process.env.RESEND_API_KEY || '';
    if (!apiKey) {
      return res.status(500).json({ error: 'Email non configurata: aggiungi RESEND_API_KEY nelle Env su Vercel' });
    }

    const resend = new Resend(apiKey);
    
    // Email per l'utente (conferma ricezione) - stile brand
    const userSubject = 'SimplyChain - Messaggio ricevuto';
    const userHtml = `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;margin:0">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="background:#ffffff;border-radius:16px;box-shadow:0 10px 25px rgba(2,6,23,0.08);overflow:hidden">
              <tr>
                <td style="background:#4f46e5;padding:20px 24px">
                  <h1 style="margin:0;font:600 20px/1.2 system-ui,Segoe UI,Roboto,Arial;color:#ffffff">SimplyChain</h1>
                  <div style="margin-top:4px;color:#e0e7ff;font:500 13px/1.6 system-ui">Messaggio ricevuto</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px">
                  <h2 style="margin:0 0 12px 0;font:700 18px/1.4 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">Grazie per averci contattato!</h2>
                  <p style="margin:0 0 12px 0;font:400 14px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.</p>
                  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                    <div style="background:#ecfeff;padding:10px 14px;color:#0e7490;font:600 13px/1.6 system-ui">Riepilogo</div>
                    <div style="padding:12px 14px;background:#ffffff">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                        <tr><td style="padding:4px 0;width:40%"><strong>Nome</strong></td><td style="padding:4px 0;color:#334155">${nome}</td></tr>
                        ${azienda ? `<tr><td style=\"padding:4px 0\"><strong>Azienda</strong></td><td style=\"padding:4px 0;color:#334155\">${azienda}</td></tr>` : ''}
                        <tr><td style="padding:4px 0"><strong>Email</strong></td><td style="padding:4px 0;color:#334155">${email}</td></tr>
                        <tr><td style="padding:4px 0;vertical-align:top"><strong>Messaggio</strong></td><td style="padding:4px 0;color:#334155;white-space:pre-wrap">${messaggio}</td></tr>
                      </table>
                    </div>
                  </div>
                  <div style="margin-top:18px">
                    <a href="https://simplychain.it" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font:600 14px/1 system-ui,Segoe UI,Roboto,Arial">Visita il sito</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f8fafc;padding:14px 24px;text-align:center;color:#64748b;font:500 12px/1.7 system-ui">© ${new Date().getFullYear()} SimplyChain</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    // Email per SimplyChain (notifica nuovo messaggio)
    const adminSubject = `SimplyChain Richiesta Custom da "${azienda || nome}"`;
    const adminHtml = `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;margin:0">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="background:#ffffff;border-radius:16px;box-shadow:0 10px 25px rgba(2,6,23,0.08);overflow:hidden">
              <tr>
                <td style="background:#4f46e5;padding:20px 24px">
                  <h1 style="margin:0;font:600 20px/1.2 system-ui,Segoe UI,Roboto,Arial;color:#ffffff">SimplyChain</h1>
                  <div style="margin-top:4px;color:#e0e7ff;font:500 13px/1.6 system-ui">Richiesta Custom</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px">
                  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                    <div style="background:#fff7ed;padding:10px 14px;color:#9a3412;font:600 13px/1.6 system-ui">Dettagli</div>
                    <div style="padding:12px 14px;background:#ffffff">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                        <tr><td style="padding:4px 0;width:40%"><strong>Nome</strong></td><td style="padding:4px 0;color:#334155">${nome}</td></tr>
                        ${azienda ? `<tr><td style=\"padding:4px 0\"><strong>Azienda</strong></td><td style=\"padding:4px 0;color:#334155\">${azienda}</td></tr>` : ''}
                        <tr><td style="padding:4px 0"><strong>Email</strong></td><td style="padding:4px 0;color:#334155">${email}</td></tr>
                        <tr><td style="padding:4px 0;vertical-align:top"><strong>Messaggio</strong></td><td style="padding:4px 0;color:#334155;white-space:pre-wrap">${messaggio}</td></tr>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f8fafc;padding:14px 24px;text-align:center;color:#64748b;font:500 12px/1.7 system-ui">© ${new Date().getFullYear()} SimplyChain</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    // Invia email di conferma all'utente
    const userEmailResult = await resend.emails.send({
      from: process.env.RESEND_FROM || 'SimplyChain <onboarding@resend.dev>',
      to: email,
      subject: userSubject,
      html: userHtml,
    });

    // Invia notifica a SimplyChain
    const adminEmailResult = await resend.emails.send({
      from: process.env.RESEND_FROM || 'SimplyChain <onboarding@resend.dev>',
      to: 'sfy.startup@gmail.com',
      subject: adminSubject,
      html: adminHtml,
    });

    if (userEmailResult.error || adminEmailResult.error) {
      console.error('resend error', userEmailResult.error || adminEmailResult.error);
      return res.status(500).json({ error: 'Invio email fallito' });
    }

    return res.status(200).json({ 
      success: true, 
      userEmailId: userEmailResult.data?.id,
      adminEmailId: adminEmailResult.data?.id
    });

  } catch (e) {
    console.error('send-email error', e);
    res.status(500).json({ error: e?.message || 'Errore server' });
  }
}