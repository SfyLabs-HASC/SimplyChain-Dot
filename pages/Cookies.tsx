import React from 'react';

const Cookies: React.FC = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Cookie Policy di SimplyChain</h1>
      <p className="text-slate-600 mb-8">Ultimo aggiornamento: 25/09/2025</p>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-700 mb-8">
          La presente Cookie Policy ha lo scopo di descrivere le modalità di gestione dei cookie del sito web https://www.simplychain.it/ ("Piattaforma"), di proprietà di SFY srl ("Titolare").
        </p>
        
        <p className="text-slate-700 mb-8">
          Questo documento è parte integrante della Privacy Policy della Piattaforma.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Titolare del Trattamento</h2>
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
          <p className="text-slate-700 mb-2">Il Titolare del Trattamento è:</p>
          <p className="text-slate-700">
            <strong>SFY srl</strong><br />
            Sede legale: [Inserire indirizzo completo di SFY srl]<br />
            Email di contatto: <a className="text-primary hover:underline" href="mailto:info@simplychain.it">info@simplychain.it</a>
          </p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Cosa sono i Cookie?</h2>
        <p className="text-slate-700 mb-8">
          I cookie sono piccoli file di testo che i siti visitati dall'utente inviano e registrano sul suo computer o dispositivo mobile, per essere poi ritrasmessi agli stessi siti alla successiva visita. Grazie ai cookie, un sito ricorda le azioni e le preferenze dell'utente (come, ad esempio, i dati di login, la lingua prescelta, le dimensioni dei caratteri, altre impostazioni di visualizzazione, ecc.) in modo che non debbano essere indicate nuovamente quando l'utente torni a visitare detto sito o navighi da una pagina all'altra di esso.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Tipologie di Cookie Utilizzati dalla Piattaforma</h2>
        <p className="text-slate-700 mb-4">
          Questa Piattaforma utilizza diverse tipologie di cookie per varie finalità:
        </p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">A) Cookie Tecnici</h3>
        <p className="text-slate-700 mb-4">
          Questi cookie sono essenziali per il corretto funzionamento della Piattaforma e non richiedono il consenso dell'utente. Vengono utilizzati per permettere la navigazione tra le pagine, l'accesso ad aree riservate (login), e per garantire la sicurezza del sito.
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-6">
          <li><strong>Cookie di navigazione o di sessione:</strong> Garantiscono la normale navigazione e fruizione del sito. Vengono cancellati automaticamente alla chiusura del browser.</li>
          <li><strong>Cookie di funzionalità:</strong> Permettono all'utente la navigazione in funzione di una serie di criteri selezionati (ad esempio, la lingua) al fine di migliorare il servizio reso.</li>
        </ul>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-800 font-medium">ℹ️ Importante</p>
          <p className="text-blue-700 text-sm">
            Senza questi cookie, la Piattaforma potrebbe non funzionare correttamente.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">B) Cookie Analitici</h3>
        <p className="text-slate-700 mb-4">
          Questi cookie sono utilizzati per raccogliere informazioni, in forma aggregata e anonima, sul numero degli utenti e su come questi visitano la Piattaforma (es. pagine visitate, tempo di permanenza). Queste informazioni ci aiutano a capire come migliorare il nostro servizio.
        </p>
        <p className="text-slate-700 mb-6">
          La Piattaforma utilizza cookie analitici di terze parti (es. Google Analytics) con strumenti che riducono il potere identificativo dei cookie (anonimizzazione dell'indirizzo IP) e con impostazioni che impediscono alla terza parte di incrociare le informazioni raccolte con altre di cui già dispone. A queste condizioni, i cookie analitici sono assimilati ai cookie tecnici e non richiedono il consenso dell'utente.
        </p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">C) Cookie di Profilazione e Marketing</h3>
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <p className="text-green-800 font-medium">✅ Stato Attuale</p>
          <p className="text-green-700 text-sm">
            Allo stato attuale, questa Piattaforma non utilizza cookie di profilazione propri.
          </p>
        </div>
        <p className="text-slate-700 mb-6">
          Questi cookie, se utilizzati, sono volti a creare profili relativi all'utente al fine di inviare messaggi pubblicitari in linea con le preferenze manifestate dallo stesso nell'ambito della navigazione in rete. L'installazione di questi cookie richiede il consenso preventivo dell'utente.
        </p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">D) Cookie di Terze Parti</h3>
        <p className="text-slate-700 mb-4">
          Durante la navigazione, l'utente potrebbe ricevere sul suo terminale anche cookie di siti o di web server diversi ("terze parti"). Questo accade perché sul sito possono essere presenti elementi come, ad esempio, pulsanti di social login, immagini, mappe, o specifici link a pagine web di altri domini.
        </p>
        <p className="text-slate-700 mb-4">
          Per questi cookie, il Titolare è unicamente un intermediario tecnico e non ha controllo diretto sulle loro caratteristiche. La gestione delle informazioni raccolte da terze parti è disciplinata dalle relative informative cui si prega di fare riferimento.
        </p>
        <div className="space-y-2 text-slate-700 ml-4">
          <p><strong>Social Login:</strong> Se si utilizza un account di terze parti (es. Google) per registrarsi, il servizio terzo potrebbe installare i propri cookie.</p>
          <p><strong>Google:</strong> <a className="text-primary hover:underline" href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/cookies</a></p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Gestione dei Cookie</h2>
        <p className="text-slate-700 mb-4">
          L'utente può gestire le proprie preferenze relative ai cookie in qualsiasi momento tramite:
        </p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Banner dei Cookie</h3>
        <p className="text-slate-700 mb-4">
          Al primo accesso alla Piattaforma, viene mostrato un banner tramite il quale è possibile accettare tutti i cookie, rifiutarli, o scegliere quali categorie abilitare.
        </p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Impostazioni del Browser</h3>
        <p className="text-slate-700 mb-4">
          L'utente può disabilitare i cookie agendo sulle impostazioni del proprio browser. La disabilitazione dei cookie tecnici potrebbe compromettere la funzionalità del sito. Di seguito i link alle istruzioni per i browser più comuni:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-6">
          <li><strong>Google Chrome:</strong> <a className="text-primary hover:underline" href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">https://support.google.com/chrome/answer/95647</a></li>
          <li><strong>Mozilla Firefox:</strong> <a className="text-primary hover:underline" href="https://support.mozilla.org/it/kb/gestione-dei-cookie" target="_blank" rel="noopener noreferrer">https://support.mozilla.org/it/kb/gestione-dei-cookie</a></li>
          <li><strong>Microsoft Edge:</strong> <a className="text-primary hover:underline" href="https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d</a></li>
          <li><strong>Apple Safari:</strong> <a className="text-primary hover:underline" href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">https://support.apple.com/it-it/guide/safari/sfri11471/mac</a></li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Natura del Conferimento dei Dati</h2>
        <p className="text-slate-700 mb-8">
          Il conferimento dei dati tramite cookie tecnici è necessario per la navigazione del sito. Il conferimento dei dati tramite cookie analitici (non anonimizzati) o di profilazione è facoltativo e richiede il consenso preventivo dell'utente.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Diritti dell'Interessato</h2>
        <p className="text-slate-700 mb-8">
          Per conoscere e esercitare i propri diritti in materia di protezione dei dati personali, si rimanda a quanto specificato nella <a className="text-primary hover:underline" href="/privacy">Privacy Policy</a> della Piattaforma.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Modifiche a questa Cookie Policy</h2>
        <p className="text-slate-700 mb-8">
          Il Titolare si riserva il diritto di apportare modifiche alla presente Cookie Policy. Si consiglia di consultare regolarmente questa pagina per essere sempre aggiornati.
        </p>

        
      </div>
    </div>
  </div>
);

export default Cookies;

