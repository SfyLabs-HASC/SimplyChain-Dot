import React from 'react';

const Docs: React.FC = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
    <h1 className="text-4xl font-extrabold text-slate-900">Documentazione</h1>
    <p className="mt-3 text-slate-600">Guida passo‑passo all’uso di SimplyChain.</p>

    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Accesso e registrazione</h2>
      <div className="space-y-3 text-slate-700">
        <p>
          Per accedere, usa il pulsante <span className="font-semibold">Accedi</span> in alto a destra oppure il pulsante
          <span className="font-semibold"> Vai al Servizio</span> nell’hero. Se non sei collegato, si aprirà il
          <span className="font-semibold">Connect Modal</span> di Thirdweb con autenticazione tramite <span className="font-semibold">Google, Discord, Telegram, Email, X, Apple, Facebook, TikTok, Twitch</span>
          (wallet custodial con <span className="font-semibold">Account Abstraction</span> e gas sponsor).
        </p>
        <p>
          Al primo accesso, vai su <span className="font-semibold">Form</span> e compila i dati della tua azienda. Se la tua azienda è già attiva vedrai il messaggio
          <span className="font-semibold"> “Hai già attivato il tuo account”</span>; in questo caso non apparirà il testo introduttivo di registrazione.
        </p>
      </div>
    </section>

    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Crediti</h2>
      <div className="space-y-3 text-slate-700">
        <p>
          Il sistema funziona a <span className="font-semibold">crediti</span>. Puoi ricaricarli da <span className="font-semibold">Ricarica Crediti</span>. Dopo il pagamento Stripe, i crediti
          si aggiornano automaticamente via <span className="font-semibold">webhook</span>. In caso di redirect, la pagina esegue una conferma lato server (<span className="font-semibold">confirm-session</span>)
          per allineare lo stato.
        </p>
      </div>
    </section>

    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Certifica Fasi Produttive (Iscrizioni)</h2>
      <div className="space-y-3 text-slate-700">
        <p>
          In <span className="font-semibold">Dashboard → Certifica Fasi Produttive</span> crea una nuova iscrizione e aggiungi eventuali <span className="font-semibold">steps</span>
          (nome, descrizione, data, luogo, hash documento). Ogni iscrizione salva un <span className="font-semibold">batch</span> on‑chain e, se previsto, gli steps associati.
        </p>
        <p>
          Per ciascuna iscrizione puoi: <span className="font-semibold">Verificare su blockchain</span> (porta all'explorer Arbitrum),
          visualizzare l’<span className="font-semibold">Hash del documento</span>, ed <span className="font-semibold">Esportare</span> (apre un popup con tre opzioni).
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><span className="font-semibold">Genera QrCode</span>: crea un QR univoco che punta a un certificato HTML ospitato via <span className="font-semibold">Firebase Realtime Database</span>. Il QR scarica un PNG pronto alla stampa.</li>
          <li><span className="font-semibold">Certificato PDF</span>: apre una pagina di anteprima con lo stesso certificato HTML e avvia la stampa del browser per esportarlo in PDF.</li>
          <li><span className="font-semibold">Certificato HTML</span>: scarica localmente il file HTML completo e pronto alla pubblicazione su hosting privato.</li>
        </ul>
      </div>
    </section>

    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Certifica Documenti</h2>
      <div className="space-y-3 text-slate-700">
        <p>
          In <span className="font-semibold">Dashboard → Certifica Documenti</span> carica il file da certificare: il sistema calcola automaticamente l’<span className="font-semibold">hash SHA‑256</span>.
          Procedendo, l’hash viene registrato su <span className="font-semibold">Arbitrum</span> come prova immutabile. Puoi poi <span className="font-semibold">condividere via Email</span> un messaggio
          formattato con <span className="font-semibold">Resend</span> contenente hash e link di verifica on‑chain.
        </p>
        <p>
          Anche per i documenti hai l’opzione <span className="font-semibold">Esporta</span> con <span className="font-semibold">QR, PDF, HTML</span> analogamente alle iscrizioni.
        </p>
      </div>
    </section>

    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Esportazioni (QR, PDF, HTML)</h2>
      <div className="space-y-3 text-slate-700">
        <p>
          Dal popup <span className="font-semibold">Informazioni Esportazione</span> scegli la modalità:
        </p>
        <div className="rounded-xl border border-slate-200 p-4 bg-white">
          <h3 className="font-semibold text-slate-900">Genera QrCode</h3>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>Creazione certificato su <span className="font-semibold">Firebase Realtime Database</span> (RTDB).</li>
            <li>Generazione URL pubblico di visualizzazione e <span className="font-semibold">QR PNG</span> per stampa su etichette.</li>
            <li>Validità del link secondo i <a href="/termini" className="text-primary hover:underline">Termini e Condizioni</a>.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-red-200 p-4 bg-red-50">
          <h3 className="font-semibold text-slate-900">Certificato PDF</h3>
          <p className="text-sm mt-2">Anteprima in una nuova scheda con il certificato, quindi stampa in PDF dal browser.</p>
        </div>
        <div className="rounded-xl border border-emerald-200 p-4 bg-emerald-50">
          <h3 className="font-semibold text-slate-900">Certificato HTML</h3>
          <p className="text-sm mt-2">Download di un file HTML completo, con stile coerente al sito, pronto alla pubblicazione.</p>
        </div>
      </div>
    </section>

    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Verifica su Blockchain</h2>
      <p className="text-slate-700">
        Ogni registrazione espone il link di <span className="font-semibold">verifica</span> su Arbiscan (decoder) di Arbitrum. Copia il link o aprilo direttamente
        dai pulsanti <span className="font-semibold">Verifica Blockchain</span> nella dashboard.
      </p>
    </section>

    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Email e notifiche</h2>
      <p className="text-slate-700">
        Le email sono inviate tramite <span className="font-semibold">Resend</span> con template brandizzati: conferme contatto, pagamenti,
        condivisione hash documento (<span className="font-semibold">Documento Certificato</span>), ecc.
      </p>
    </section>

    <section className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-3">8. Note e Limitazioni</h2>
      <ul className="list-disc list-inside space-y-2 text-slate-700">
        <li>La blockchain registra solo l’<span className="font-semibold">hash</span>, non il contenuto del file.</li>
        <li>Le transazioni e gli hash sono <span className="font-semibold">immutabili e pubblici</span>.</li>
        <li>La validità dei link dei QR dipende dalla disponibilità del servizio (vedi <a href="/termini" className="text-primary hover:underline">Termini</a>).</li>
      </ul>
    </section>
  </div>
);

export default Docs;

