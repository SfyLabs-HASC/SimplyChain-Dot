import Stripe from 'stripe';
import { Resend } from 'resend';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  // Handle different Stripe operations based on query parameter
  // Legacy simple detection via querystring only (stable)
  let action = (req.query && req.query.action) || null;
  // Fallback: derive action from path '/api/stripe/<action>' if query missing/ignored by platform
  if (!action) {
    try {
      const path = (req.url || '').split('?')[0] || '';
      const maybe = path.split('/').filter(Boolean).pop();
      if (maybe && maybe !== 'stripe') action = maybe;
    } catch {}
  }
  try {
    // Support legacy misconfigured endpoint: /api/stripe without action but with Stripe signature
    if (!action && req.method === 'POST' && req.headers['stripe-signature']) {
      console.log('Routing POST /api/stripe to webhook due to stripe-signature header');
      return await handleWebhook(req, res);
    }

    if (action === 'create-checkout') {
      return await handleCreateCheckout(req, res);
    } else if (action === 'confirm-session') {
      return await handleConfirmSession(req, res);
    } else if (action === 'health') {
      return await handleHealth(req, res);
    } else if (action === 'webhook') {
      return await handleWebhook(req, res);
    } else if (action === 'qr-test') {
      return await handleQrTest(req, res);
    } else if (action === 'qr-create') {
      return await handleQrCreate(req, res);
    } else if (action === 'qr-view') {
      return await handleQrView(req, res);
    } else if (action === 'qr-update-status') {
      return await handleQrUpdateStatus(req, res);
    } else if (action === 'send-notarization-email') {
      return await handleSendNotarizationEmail(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid action parameter', method: req.method, url: req.url, hint: 'Use ?action=webhook|create-checkout|confirm-session|health or path /api/stripe/<action>' });
    }
  } catch (e) {
    console.error('Top-level stripe handler error:', e);
    return res.status(500).json({ error: 'Stripe handler error' });
  }
}

function ensureFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
    });
  }
  return admin.firestore();
}

function getBaseUrl(req) {
  // Prefer the current request's host to ensure links hit the same deployment
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host) return `${proto}://${host}`;
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '');
  return 'http://localhost:3000';
}

async function handleCreateCheckout(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // When bodyParser is disabled globally (for Stripe webhook), req.body may be undefined here.
  // Fallback: buffer and JSON.parse.
  let body = req.body;
  if (!body) {
    try {
      const buf = await buffer(req);
      body = JSON.parse(buf.toString('utf8'));
    } catch (e) {
      console.error('Failed to parse request body for create-checkout:', e);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { packageId, packageName, credits, amount, billingInfo, walletAddress } = body || {};

  if (!packageId || !packageName || !credits || !amount || !billingInfo) {
    return res.status(400).json({ error: 'Missing required parameters for checkout session.' });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is missing');
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packageName,
              metadata: {
                packageId,
                credits: credits.toString(),
              },
            },
            unit_amount: Math.round(amount * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://simplychain.it'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://simplychain.it'}/ricaricacrediti?payment=cancelled`,
      metadata: {
        packageId,
        credits: credits.toString(),
        packageName,
        billingType: billingInfo.type,
        billingData: JSON.stringify(billingInfo),
        walletAddress: (walletAddress || '').toLowerCase(),
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}

async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe webhook received', { id: event.id, type: event.type });

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const rawSession = event.data.object;
    // Enrich session to extract credits robustly
    let session = rawSession;
    try {
      session = await stripe.checkout.sessions.retrieve(rawSession.id, { expand: ['line_items.data.price.product'] });
    } catch (e) {
      console.warn('Failed to expand session in webhook, proceeding with raw session');
    }

    const packageId = session.metadata?.packageId;
    const packageName = session.metadata?.packageName;
    const billingType = session.metadata?.billingType;
    const billingData = JSON.parse(session.metadata?.billingData || '{}');
    const paymentIntentId = session.payment_intent;
    // Prefer explicit metadata. If missing, try product metadata or fallback by packageId map.
    let credits = parseInt(session.metadata?.credits || '0', 10);
    if (!credits || Number.isNaN(credits)) {
      try {
        const items = session?.line_items?.data || [];
        for (const it of items) {
          const prod = it?.price?.product;
          const c = prod?.metadata?.credits;
          const parsed = parseInt(String(c || ''), 10);
          if (!Number.isNaN(parsed) && parsed > 0) { credits = parsed; break; }
        }
      } catch {}
    }
    if (!credits || Number.isNaN(credits)) {
      const fallback = creditsFromPackageId(packageId);
      if (fallback) credits = fallback;
    }

    console.log(`Checkout session completed for package ${packageName} (${credits} credits)`);

    try {
      const db = ensureFirebase();
      const wallet = (session.metadata.walletAddress || '').toLowerCase();
      console.log('Webhook metadata', { wallet, credits, packageName, billingType });
      let company = null;
      let userDoc = null;
      if (wallet) {
        // Preferisci i dati dell'azienda ATTIVA; fallback a pending
        const activeSnap = await db.collection('active company').doc(wallet).get();
        if (activeSnap.exists) {
          company = activeSnap.data();
        } else {
          const compSnap = await db.collection('pending company').doc(wallet).get();
          if (compSnap.exists) {
            company = compSnap.data();
          }
        }
        const userSnap = await db.collection('users').doc(wallet).get();
        if (userSnap.exists) {
          userDoc = userSnap.data();
        }
      }

      let userInfo = {
        companyName: company?.nome || 'N/D',
        wallet: wallet || 'N/D',
        email: company?.email || 'N/D',
        sitoWeb: company?.sitoWeb || 'N/D',
        settore: company?.settore || 'N/D',
        creditsAfter: userDoc?.crediti ?? userDoc?.credits,
      };

      // Update crediti in Firebase (raccolta "active company") - IDEMPOTENTE per PaymentIntent
      if (wallet && credits > 0 && paymentIntentId) {
        const paymentsRef = db.collection('stripe_payments').doc(String(paymentIntentId));
        const companyRef = db.collection('active company').doc(wallet);
        await db.runTransaction(async (tx) => {
          const paySnap = await tx.get(paymentsRef);
          if (paySnap.exists) {
            // Già processato: non incrementare di nuovo
            return;
          }
          const companySnap = await tx.get(companyRef);
          if (companySnap.exists) {
            tx.update(companyRef, {
              crediti: admin.firestore.FieldValue.increment(credits),
              creditiUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
              creditiUpdatedBy: 'stripe',
            });
          } else {
            tx.set(companyRef, {
              walletAddress: wallet,
              crediti: credits,
              creditiUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
              creditiUpdatedBy: 'stripe',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              pending: false,
            }, { merge: true });
          }
          tx.set(paymentsRef, {
            paymentIntentId: String(paymentIntentId),
            wallet,
            credits,
            packageId,
            packageName,
            amountTotal: session.amount_total,
            currency: session.currency,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        const afterSnap = await db.collection('active company').doc(wallet).get();
        const finalCredits = afterSnap.exists ? (afterSnap.data()?.crediti || 0) : undefined;
        // Aggiorna anche i dati per la mail
        userInfo = { ...userInfo, creditsAfter: finalCredits };
        console.log(`Crediti aggiornati (idempotente) per ${wallet}: +${credits}; nuovo valore:`, afterSnap.exists ? finalCredits : 'doc inesistente');
      }

      // Send payment confirmation email (non-bloccante)
      await sendPaymentConfirmationEmail({
        paymentIntentId: paymentIntentId,
        status: 'succeeded',
        amount: (session.amount_total / 100).toFixed(2),
        paymentMethod: (session.payment_method_types || []).join(', ') || 'card',
        createdAt: new Date(session.created * 1000).toISOString(),
        userInfo,
        billingInfo: billingData,
        packageInfo: {
          credits: credits,
          pricePerCredit: (session.amount_total / 100 / credits).toFixed(2),
          totalPrice: (session.amount_total / 100).toFixed(2),
          packageName,
        }
      });

      console.log('Payment confirmation email sent successfully');

      // Credits already updated above; avoid double increment

    } catch (e) {
      console.error('Error processing webhook:', e);
      return res.status(500).json({ error: 'Failed to process payment confirmation.' });
    }
  }

  res.status(200).json({ received: true });
}

// Fallback: conferma lato server dopo redirect success se il webhook non arriva
async function handleConfirmSession(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).end('Method Not Allowed');
    }

    const sessionId = (req.query.session_id || (req.body && req.body.session_id) || '').toString();
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id mancante' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is missing');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items.data.price.product'] });
    if (!session) {
      return res.status(404).json({ error: 'Sessione non trovata' });
    }
    if (session.payment_status !== 'paid') {
      return res.status(200).json({ ok: false, status: session.payment_status, session: { id: session.id, mode: session.mode, payment_status: session.payment_status } });
    }

    // Ricicla la stessa logica del webhook per l'aggiornamento idempotente
    const packageId = session.metadata?.packageId;
    let credits = parseInt(session.metadata?.credits || '0', 10);
    if (!credits || Number.isNaN(credits)) {
      try {
        const items = session?.line_items?.data || [];
        for (const it of items) {
          const prod = it?.price?.product;
          const c = prod?.metadata?.credits;
          const parsed = parseInt(String(c || ''), 10);
          if (!Number.isNaN(parsed) && parsed > 0) { credits = parsed; break; }
        }
      } catch {}
    }
    if (!credits || Number.isNaN(credits)) {
      const fallback = creditsFromPackageId(packageId);
      if (fallback) credits = fallback;
    }
    const packageName = session.metadata?.packageName;
    const billingType = session.metadata?.billingType;
    const billingData = JSON.parse(session.metadata?.billingData || '{}');
    const paymentIntentId = session.payment_intent;
    const wallet = (session.metadata?.walletAddress || '').toLowerCase();

    if (!wallet || !credits || !paymentIntentId) {
      return res.status(400).json({ error: 'Metadati incompleti nella sessione' });
    }

    const db = ensureFirebase();
    const paymentsRef = db.collection('stripe_payments').doc(String(paymentIntentId));
    const companyRef = db.collection('active company').doc(wallet);

    let applied = false;
    await db.runTransaction(async (tx) => {
      const paySnap = await tx.get(paymentsRef);
      if (paySnap.exists) {
        return; // già processato
      }
      const companySnap = await tx.get(companyRef);
      if (companySnap.exists) {
        tx.update(companyRef, {
          crediti: admin.firestore.FieldValue.increment(credits),
          creditiUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          creditiUpdatedBy: 'stripe-confirm',
        });
      } else {
        tx.set(companyRef, {
          walletAddress: wallet,
          crediti: credits,
          creditiUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          creditiUpdatedBy: 'stripe-confirm',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          pending: false,
        }, { merge: true });
      }
      tx.set(paymentsRef, {
        paymentIntentId: String(paymentIntentId),
        wallet,
        credits,
        packageId,
        packageName,
        amountTotal: session.amount_total,
        currency: session.currency,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        via: 'confirm-session',
      });
      applied = true;
    });
    // Do not send email from confirm-session; rely on webhook

    return res.status(200).json({ ok: true, status: 'paid', applied });
  } catch (e) {
    console.error('confirm-session error', e);
    return res.status(500).json({ error: 'Errore conferma sessione' });
  }
}

// Fallback mapping if Stripe metadata is missing
function creditsFromPackageId(packageId) {
  if (!packageId) return 0;
  const map = {
    '10-credits': 10,
    '50-credits': 50,
    '100-credits': 100,
    '500-credits': 500,
    '1000-credits': 1000,
  };
  return map[packageId] || 0;
}

// Minimal health/debug endpoint to verify environment and reachability (does not leak secrets)
async function handleHealth(req, res) {
  try {
    const env = {
      STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
      STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || null,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || null,
      FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
      FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    };
    // Optionally perform a lightweight call to Stripe API to confirm credentials
    let stripeOk = false;
    try {
      // Retrieve a non-existent session to just test auth; it will throw 404 if auth is OK
      await stripe.customers.list({ limit: 1 });
      stripeOk = true;
    } catch (err) {
      stripeOk = false;
    }
    return res.status(200).json({ ok: true, env, stripeOk });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
}

async function sendPaymentConfirmationEmail(data) {
  const { 
    paymentIntentId, 
    status, 
    amount, 
    paymentMethod, 
    createdAt, 
    userInfo, 
    billingInfo, 
    packageInfo 
  } = data;

  // Format date
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Format billing info
  const billingType = billingInfo.type === 'azienda' ? 'azienda' : 'privato';
  const billingName = billingInfo.type === 'azienda' 
    ? billingInfo.denominazioneSociale 
    : `${billingInfo.nome} ${billingInfo.cognome}`;
  const billingId = billingInfo.type === 'azienda' 
    ? billingInfo.partitaIva 
    : billingInfo.codiceFiscale;
  const billingCode = billingInfo.type === 'azienda' 
    ? billingInfo.codiceUnivoco 
    : 'N/D';

  const subjectUser = userInfo?.companyName && userInfo.companyName !== 'N/D' ? userInfo.companyName : (userInfo?.wallet || 'Utente');
  const mailOptions = {
    from: process.env.RESEND_FROM || 'SimplyChain <onboarding@resend.dev>',
    to: 'sfy.startup@gmail.com',
    subject: `SimplyChain - PAGAMENTO RICEVUTO DA "${subjectUser}"`,
    html: `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;margin:0">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="background:#ffffff;border-radius:16px;box-shadow:0 10px 25px rgba(2,6,23,0.08);overflow:hidden">
              <tr>
                <td style="background:#4f46e5;padding:20px 24px">
                  <h1 style="margin:0;font:600 20px/1.2 system-ui,Segoe UI,Roboto,Arial;color:#ffffff">SimplyChain</h1>
                  <div style="margin-top:4px;color:#e0e7ff;font:500 13px/1.6 system-ui,Segoe UI,Roboto,Arial">Pagamento Ricevuto</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px">
                  <p style="margin:0 0 14px 0;font:400 14px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">Dettagli della transazione Stripe completata.</p>

                  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                    <div style="background:#eef2ff;padding:10px 14px;color:#3730a3;font:600 13px/1.6 system-ui">Transazione</div>
                    <div style="padding:12px 14px;background:#ffffff">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                        <tr><td style="padding:4px 0;width:40%"><strong>ID PaymentIntent</strong></td><td style="padding:4px 0;color:#334155">${paymentIntentId}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Stato</strong></td><td style="padding:4px 0;color:#166534">${status}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Importo</strong></td><td style="padding:4px 0;color:#334155">${amount} €</td></tr>
                        <tr><td style="padding:4px 0"><strong>Metodo</strong></td><td style="padding:4px 0;color:#334155">${paymentMethod}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Data</strong></td><td style="padding:4px 0;color:#334155">${formattedDate}</td></tr>
                      </table>
                    </div>
                  </div>

                  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                    <div style="background:#ecfeff;padding:10px 14px;color:#0e7490;font:600 13px/1.6 system-ui">Dati registrazione sito</div>
                    <div style="padding:12px 14px;background:#ffffff">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                        <tr><td style="padding:4px 0;width:40%"><strong>Nome/Azienda</strong></td><td style="padding:4px 0;color:#334155">${userInfo?.companyName || 'N/D'}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Email</strong></td><td style="padding:4px 0;color:#334155">${userInfo?.email || 'N/D'}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Sito Web</strong></td><td style="padding:4px 0;color:#334155">${userInfo?.sitoWeb || 'N/D'}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Settore</strong></td><td style="padding:4px 0;color:#334155">${userInfo?.settore || 'N/D'}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Wallet</strong></td><td style="padding:4px 0;color:#334155">${userInfo?.wallet || 'N/D'}</td></tr>
                        ${userInfo?.creditsAfter !== undefined ? `<tr><td style="padding:4px 0"><strong>Crediti dopo acquisto</strong></td><td style="padding:4px 0;color:#334155">${userInfo.creditsAfter}</td></tr>` : ''}
                      </table>
                    </div>
                  </div>

                  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                    <div style="background:#f0fdf4;padding:10px 14px;color:#166534;font:600 13px/1.6 system-ui">Dati di Fatturazione</div>
                    <div style="padding:12px 14px;background:#ffffff">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                        <tr><td style="padding:4px 0;width:40%"><strong>Tipo</strong></td><td style="padding:4px 0;color:#334155">${billingType}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Ragione Sociale / Nome</strong></td><td style="padding:4px 0;color:#334155">${billingName}</td></tr>
                        <tr><td style="padding:4px 0"><strong>P.IVA/CF</strong></td><td style="padding:4px 0;color:#334155">${billingId}</td></tr>
                        <tr><td style="padding:4px 0"><strong>SDI/PEC</strong></td><td style="padding:4px 0;color:#334155">${billingCode}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Indirizzo</strong></td><td style="padding:4px 0;color:#334155">${billingInfo.indirizzo || 'N/D'}</td></tr>
                      </table>
                    </div>
                  </div>

                  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                    <div style="background:#fff7ed;padding:10px 14px;color:#9a3412;font:600 13px/1.6 system-ui">Pacchetto</div>
                    <div style="padding:12px 14px;background:#ffffff">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                        <tr><td style="padding:4px 0;width:40%"><strong>Nome Pacchetto</strong></td><td style="padding:4px 0;color:#334155">${packageInfo.packageName || 'N/D'}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Crediti</strong></td><td style="padding:4px 0;color:#334155">${packageInfo.credits}</td></tr>
                        <tr><td style="padding:4px 0"><strong>Prezzo/Credito</strong></td><td style="padding:4px 0;color:#334155">${packageInfo.pricePerCredit} €</td></tr>
                        <tr><td style="padding:4px 0"><strong>Totale</strong></td><td style="padding:4px 0;color:#334155">${packageInfo.totalPrice} €</td></tr>
                      </table>
                    </div>
                  </div>

                  <p style="margin:18px 0 0 0;font:400 12px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#475569">Grazie per aver utilizzato <strong style="color:#4f46e5">SimplyChain</strong>.</p>
                </td>
              </tr>
              <tr>
                <td style="background:#f8fafc;padding:14px 24px;text-align:center;color:#64748b;font:500 12px/1.7 system-ui">© ${new Date().getFullYear()} SimplyChain</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  };

  console.log('Sending payment confirmation email to sfy.startup@gmail.com');
  const result = await resend.emails.send(mailOptions);
  console.log('Payment confirmation email sent successfully:', result.data?.id);
  return result;
}

// ==== QR Consolidated Handlers (migrated from /api/qr-system) ====
async function handleQrTest(req, res) {
  try {
    const env = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'MISSING',
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_DATABASE_URL: !!process.env.FIREBASE_DATABASE_URL,
      PUBLIC_SITE_URL: !!process.env.PUBLIC_SITE_URL,
    };
    // Touch RTDB
    if (!admin.apps.length) ensureFirebase();
    const db = admin.database();
    await db.ref('test/qr').set({ ts: Date.now() });
    return res.status(200).json({ ok: true, env });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

async function handleQrCreate(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { batch, companyName, walletAddress } = req.body || {};
  if (!batch || !companyName || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields: batch, companyName, walletAddress' });
  }
  if (!admin.apps.length) ensureFirebase();
  const rtdb = admin.database();
  const cert = {
    batchId: String(batch.batchId),
    name: String(batch.name || ''),
    companyName: String(companyName || ''),
    walletAddress: String(walletAddress || ''),
    date: String(batch.date || ''),
    location: String(batch.location || ''),
    description: String(batch.description || ''),
    transactionHash: String(batch.transactionHash || ''),
    imageIpfsHash: String(batch.imageIpfsHash || ''),
    steps: Array.isArray(batch.steps) ? batch.steps : [],
    createdAt: new Date().toISOString(),
    isActive: true,
    viewCount: 0,
  };
  // Deterministic ID to keep link stable across regenerations
  const cleanCompany = cert.companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const id = `${cleanCompany}_${cert.batchId}`;
  await rtdb.ref(`certificates/${id}`).set({ ...cert, createdAt: admin.database.ServerValue.TIMESTAMP });
  const base = getBaseUrl(req);
  const url = `${base}/api/stripe?action=qr-view&id=${encodeURIComponent(id)}`;
  const QRCode = await import('qrcode');
  const dataUrl = await QRCode.default.toDataURL(url, { width: 1000, margin: 2, color: { dark: '#000000', light: '#FFFFFF' }, errorCorrectionLevel: 'M' });
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename="${(cert.name || 'qrcode').replace(/[^a-zA-Z0-9_\-]/g, '_')}_qrcode.png"`);
  return res.send(png);
}

async function handleQrView(req, res) {
  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: 'Certificate ID is required' });
  if (!admin.apps.length) ensureFirebase();
  const rtdb = admin.database();
  const snap = await rtdb.ref(`certificates/${id}`).once('value');
  const data = snap.val();
  if (!data) return res.status(404).send('<h1 style="font-family:system-ui;color:#ef4444">Certificato non trovato</h1>');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(generateQrCertificateHTML(data));
}

async function handleQrUpdateStatus(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { walletAddress, batchId, qrCodeGenerated } = req.body || {};
  if (!walletAddress || !batchId || typeof qrCodeGenerated === 'undefined') return res.status(400).json({ error: 'Missing required fields' });
  if (!admin.apps.length) ensureFirebase();
  const db = admin.firestore();
  await db.collection('companies').doc(walletAddress).collection('batches').doc(String(batchId)).set({
    qrCodeGenerated: !!qrCodeGenerated,
    qrCodeGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return res.json({ success: true });
}

function generateQrCertificateHTML(data) {
  const template = process.env.EXPLORER_TX_URL_TEMPLATE || 'https://arbiscan.io/inputdatadecoder?tx={txHash}';
  const verifyUrl = data.transactionHash ? template.replace('{txHash}', data.transactionHash) : '';
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const steps = Array.isArray(data.steps) ? data.steps : [];
  const stepsHtml = steps.map((s, i) => `
    <div class="step">
      <div class="step-number">${i + 1}</div>
      <div class="step-header">${esc(s.eventName || `Step ${i + 1}`)}</div>
      <div class="step-details">
        <div class="step-detail"><strong><span class="material-symbols-outlined">description</span> Descrizione:</strong><br>${esc(s.description || 'N/D')}</div>
        <div class="step-detail"><strong><span class="material-symbols-outlined">calendar_month</span> Data:</strong><br>${esc(s.date || 'N/D')}</div>
        <div class="step-detail"><strong><span class="material-symbols-outlined">location_on</span> Luogo:</strong><br>${esc(s.location || 'N/D')}</div>
      </div>
    </div>
  `).join('');
  // Light theme aligned with site colors
  return `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(data.name)} - Certificato di Tracciabilità</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap"><style>.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#ffffff;color:#1e293b;min-height:100vh;padding:20px;line-height:1.6}.certificate-container{max-width:900px;margin:0 auto;background:#ffffff;border-radius:20px;padding:40px;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #e2e8f0;backdrop-filter:blur(5px);position:relative}.header{text-align:center;margin-bottom:40px;border-bottom:2px solid #e0e7ff;padding-bottom:30px}.company-name-box{background:#f1f5f9;padding:20px 30px;border-radius:15px;margin-bottom:20px;border:2px solid #cbd5e1;box-shadow:none}.company-name{font-size:2.5rem;font-weight:bold;color:#4f46e5;margin:0;text-shadow:none}.subtitle{font-size:1.2rem;color:#64748b;margin-bottom:5px}.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:30px}.info-item{background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;transition:transform 0.2s ease,box-shadow 0.2s ease}.info-item:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.08)}.info-label{font-weight:600;color:#4f46e5;margin-bottom:8px;display:flex;align-items:center;gap:8px}.info-value{color:#1e293b;font-size:1.1rem;word-break:break-word}.blockchain-link{display:inline-flex;align-items:center;gap:5px;color:#0ea5e9;text-decoration:none;font-weight:500;padding:10px 16px;background:#e0f7fa;border-radius:25px;border:1px solid #a7e9f7;transition:all 0.3s ease;margin-top:10px}.blockchain-link:hover{background:#b2ebf2;transform:translateY(-1px);box-shadow:0 4px 10px rgba(0,0,0,0.1)}.section-title{font-size:1.8rem;font-weight:bold;color:#4f46e5;margin-bottom:20px;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px}.steps-section{margin-top:40px}.step{background:#f0f9ff;border:1px solid #e0f2fe;border-radius:12px;padding:25px;margin-bottom:20px;position:relative;transition:transform 0.2s ease,box-shadow 0.2s ease}.step:hover{transform:translateX(5px);box-shadow:0 8px 20px rgba(0,0,0,0.08)}.step-number{position:absolute;top:-10px;left:20px;background:#0ea5e9;color:#ffffff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.9rem}.step-header{font-size:1.3rem;font-weight:bold;color:#0ea5e9;margin-bottom:15px;margin-left:20px}.step-details{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;margin-left:20px}.step-detail{font-size:0.95rem;color:#334155;background:#f1f5f9;padding:12px;border-radius:8px;border:1px solid #e2e8f0}.step-detail strong{color:#0ea5e9}.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #e0e7ff;color:#64748b}@media print{body{background:#ffffff!important;padding:0!important}.certificate-container{box-shadow:none!important;border:none!important;padding:20px!important}.view-counter{display:none!important}}@media (max-width:768px){.certificate-container{padding:20px;margin:10px}.title{font-size:2rem}.info-grid{grid-template-columns:1fr}.step-details{grid-template-columns:1fr}}</style></head><body><div class="certificate-container"><div class="header"><div class="company-name-box"><h1 class="company-name">${esc(data.companyName)}</h1></div><p class="subtitle">Certificato di Tracciabilità Blockchain</p></div><h2 class="section-title"><span class="material-symbols-outlined">info</span> Informazioni Iscrizione</h2><div class="info-grid"><div class="info-item"><div class="info-label"><span class="material-symbols-outlined">inventory_2</span> Nome Prodotto</div><div class="info-value">${esc(data.name)}</div></div><div class="info-item"><div class="info-label"><span class="material-symbols-outlined">calendar_month</span> Data di Origine</div><div class="info-value">${esc(data.date || 'N/D')}</div></div><div class="info-item"><div class="info-label"><span class="material-symbols-outlined">location_on</span> Luogo di Produzione</div><div class="info-value">${esc(data.location || 'N/D')}</div></div><div class="info-item"><div class="info-label"><span class="material-symbols-outlined">verified</span> Stato</div><div class="info-value"><span class="material-symbols-outlined">check_circle</span> Certificato Attivo</div></div>${verifyUrl ? `<div class=\"info-item\"><div class=\"info-label\"><span class=\"material-symbols-outlined\">link</span> Verifica Blockchain</div><div class=\"info-value\"><a href=\"${verifyUrl}\" target=\"_blank\" class=\"blockchain-link\"><span class=\"material-symbols-outlined\">travel_explore</span> Verifica su Arbitrum</a></div></div>` : ''}</div>${steps.length ? `<div class=\"steps-section\"><h2 class=\"section-title\"><span class=\"material-symbols-outlined\">sync</span> Fasi di Lavorazione</h2>${stepsHtml}</div>` : ''}<div class="footer"><p><span class="material-symbols-outlined">link</span> Certificato generato con <a href="https://simplychain.it" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;text-decoration:none"><strong>SimplyChain</strong></a></p><p>Servizio prodotto da <a href="https://www.stickyfactory.it/" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;text-decoration:none"><strong>SFY s.r.l.</strong></a></p><p><span class="material-symbols-outlined">mail</span> Contattaci: sfy.startup@gmail.com</p></div></div></body></html>`;
}

// ==== Notarization Email (migrated from /api/send-notarization-email) ====
async function handleSendNotarizationEmail(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return res.end();
  }
  try {
    const { to, hash, link } = req.body || {};
    if (!to || !hash) {
      return res.status(400).json({ error: 'Parametri mancanti (to, hash)' });
    }
    const apiKey = process.env.RESEND_API_KEY || '';
    if (!apiKey) {
      return res.status(500).json({ error: 'Email non configurata: aggiungi RESEND_API_KEY nelle Env su Vercel' });
    }
    const localResend = new Resend(apiKey);
    const subject = 'SimplyChain - Documento Certificato';
    const html = `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;margin:0">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="background:#ffffff;border-radius:16px;box-shadow:0 10px 25px rgba(2,6,23,0.08);overflow:hidden">
              <tr>
                <td style="background:#4f46e5;padding:20px 24px">
                  <h1 style="margin:0;font:600 20px/1.2 system-ui,Segoe UI,Roboto,Arial;color:#ffffff">SimplyChain</h1>
                  <div style="margin-top:4px;color:#e0e7ff;font:500 13px/1.6 system-ui">Documento Certificato</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px">
                  <h2 style="margin:0 0 12px 0;font:700 18px/1.4 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">Hai Certificato il tuo documento!</h2>
                  <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:14px 0">
                    <div style="background:#ecfeff;padding:10px 14px;color:#0e7490;font:600 13px/1.6 system-ui">Dettagli</div>
                    <div style="padding:12px 14px;background:#ffffff">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 13px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                        <tr>
                          <td style="padding:4px 0;width:40%"><strong>Hash</strong></td>
                          <td style="padding:4px 0;color:#334155"><code style="font-family:ui-monospace,Menlo,Monaco,Consolas,monospace">${hash}</code></td>
                        </tr>
                        ${link ? `<tr><td style=\"padding:4px 0\"><strong>Verifica su blockchain</strong></td><td style=\"padding:4px 0\"><a href=\"${link}\" target=\"_blank\" rel=\"noreferrer\">${link}</a></td></tr>` : ''}
                      </table>
                    </div>
                  </div>
                  <div style="font:400 14px/1.7 system-ui,Segoe UI,Roboto,Arial;color:#0f172a">
                    <p style="margin:0 0 10px 0">Questo hash è registrato in modo permanente sulla blockchain, creando una prova immutabile dell'esistenza del documento a una data e un'ora specifiche. Se il file verrà modificato anche di un solo byte, il suo hash cambierà, rendendo immediatamente evidente qualsiasi alterazione.</p>
                    <p style="margin:0">Questo processo non salva il file sulla blockchain, ma solo la sua impronta digitale. In questo modo la tua privacy rimane protetta, mentre la prova crittografica della sua esistenza resta pubblica e verificabile per sempre.</p>
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
    const fromEmail = process.env.RESEND_FROM || 'SimplyChain <onboarding@resend.dev>';
    const { data, error } = await localResend.emails.send({ from: fromEmail, to, subject, html });
    if (error) return res.status(500).json({ error: 'Invio email fallito', details: error.message });
    return res.status(200).json({ id: data?.id || 'ok' });
  } catch (e) {
    console.error('send-notarization-email error', e);
    res.status(500).json({ error: e?.message || 'Errore server' });
  }
}