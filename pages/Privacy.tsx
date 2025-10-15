import React from 'react';

const Privacy: React.FC = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy di SimplyChain</h1>
      <p className="text-slate-600 mb-8">Ultimo aggiornamento: 26/09/2025</p>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-700 mb-8">
          La presente Informativa sulla Privacy descrive come i tuoi dati personali vengono raccolti, utilizzati e protetti quando utilizzi la piattaforma web https://www.simplychain.it/ ("Piattaforma") e i relativi servizi ("Servizi"), di proprietà di SFY srl ("Titolare").
        </p>
        <p className="text-slate-700 mb-8">
          Il Regolamento UE 2016/679 ("GDPR") ha l'obiettivo di garantire che il trattamento dei dati personali si svolga nel rispetto dei diritti, delle libertà fondamentali e della dignità delle persone, con particolare riferimento alla riservatezza e all'identità personale. È pertanto nostro dovere informarti sulla nostra politica in materia di privacy.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Titolare del Trattamento</h2>
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
          <p className="text-slate-700 mb-2">Il Titolare del Trattamento dei dati è:</p>
          <p className="text-slate-700">
            <strong>SFY srl</strong><br />
            Sede legale: [Inserire indirizzo completo di SFY srl]<br />
            Email di contatto: <a className="text-primary hover:underline" href="mailto:info@simplychain.it">info@simplychain.it</a>
          </p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Oggetto del Trattamento</h2>
        <p className="text-slate-700 mb-4">Il Titolare tratta i dati personali identificativi e di contatto (es. nome, cognome, email, dati anagrafici aziendali, P.IVA) e i dati relativi ai pagamenti, da te comunicati in fase di registrazione e utilizzo dei Servizi.</p>
        <p className="text-slate-700 mb-4">La Piattaforma è progettata per trattare i dati necessari all'erogazione del servizio (es. hash dei file, informazioni di filiera). I contenuti dei tuoi documenti non vengono salvati sui nostri sistemi, ma solo la loro impronta digitale (hash).</p>
        <p className="text-slate-700 mb-8">La Piattaforma non è destinata a trattare "dati particolari" (ai sensi dell'art. 9 GDPR), quali dati che rivelino l'origine razziale o etnica, le opinioni politiche, le convinzioni religiose o filosofiche, l'appartenenza sindacale, dati genetici, biometrici, dati relativi alla salute o alla vita sessuale.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Finalità del Trattamento</h2>
        <p className="text-slate-700 mb-2">I tuoi dati personali sono trattati:</p>
        <p className="text-slate-700 mb-2"><strong>A) Senza il tuo consenso espresso (art. 6, lett. b, c, f, GDPR), per le seguenti Finalità di Servizio:</strong></p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
          <li>Permettere la registrazione alla Piattaforma e la gestione del tuo account.</li>
          <li>Erogare i Servizi richiesti (es. registrazione di hash su blockchain, tracciabilità, etc.).</li>
          <li>Adempiere agli obblighi precontrattuali, contrattuali e fiscali derivanti da rapporti con te in essere.</li>
          <li>Adempiere agli obblighi previsti dalla legge, da un regolamento, dalla normativa comunitaria o da un ordine dell’Autorità.</li>
          <li>Esercitare i diritti del Titolare, ad esempio il diritto di difesa in giudizio.</li>
        </ul>
        <p className="text-slate-700 mt-4 mb-2"><strong>B) Solo previo tuo specifico e distinto consenso (art. 7 GDPR), per Finalità di Marketing:</strong></p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-8">
          <li>Inviarti via email newsletter, comunicazioni commerciali e/o materiale pubblicitario su prodotti o Servizi offerti dal Titolare.</li>
          <li>Se sei già nostro cliente, potremo inviarti comunicazioni commerciali relative a servizi analoghi a quelli di cui hai già usufruito, salvo tuo dissenso.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Base Giuridica del Trattamento</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-8">
          <li>Nell'esecuzione del contratto di servizio da te sottoscritto (art. 6, lett. b, GDPR).</li>
          <li>Nell'adempimento di obblighi di legge (es. fiscali e contabili) (art. 6, lett. c, GDPR).</li>
          <li>Nel legittimo interesse del Titolare per analisi statistiche e controllo di gestione interno (art. 6, lett. f, GDPR).</li>
          <li>Nel tuo consenso per le finalità di marketing (art. 6, lett. a, GDPR).</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Modalità di Trattamento e Tempi di Conservazione</h2>
        <p className="text-slate-700 mb-2">Il trattamento dei tuoi dati è improntato ai principi di correttezza, liceità e trasparenza. I dati sono sottoposti a trattamento digitale e/o cartaceo, con logiche strettamente correlate alle finalità indicate e, comunque, in modo da garantire la sicurezza e la riservatezza.</p>
        <p className="text-slate-700 mb-4">Il Titolare tratterà i dati personali per il tempo necessario per adempiere alle finalità di cui sopra e comunque per non oltre 10 anni dalla cessazione del rapporto per le Finalità di Servizio, come imposto dalla legge.</p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            ⚠️ Dati su Blockchain: Ti preghiamo di notare che, per la natura stessa della tecnologia blockchain, le transazioni e i dati registrati su di essa (come gli hash dei documenti, gli indirizzi dei wallet e le informazioni sulla transazione) rimarranno permanentemente e immutabilmente registrati sul registro distribuito.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Comunicazione e Trasferimento dei Dati</h2>
        <p className="text-slate-700 mb-2">I tuoi dati potranno essere resi accessibili a dipendenti e collaboratori del Titolare, nella loro qualità di incaricati del trattamento. Potranno inoltre essere comunicati a soggetti terzi (es. provider di servizi tecnici, gestori di pagamenti, hosting provider) nominati, se necessario, Responsabili del Trattamento da parte del Titolare.</p>
        <p className="text-slate-700 mb-4">Utilizziamo fornitori di primaria importanza per garantire la sicurezza e l'efficienza dei servizi. La nostra infrastruttura si appoggia su data center situati all'interno dell'Unione Europea (es. Amazon Web Services con region europee).</p>
        <p className="text-slate-700 mb-8">Tuttavia, le informazioni relative alle transazioni blockchain (hash, indirizzi wallet) sono per loro natura pubbliche e distribuite a livello globale.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Natura del Conferimento dei Dati</h2>
        <p className="text-slate-700 mb-2">Il conferimento dei dati per le Finalità di Servizio (punto 2.A) è obbligatorio. In loro assenza, non potremo garantirti i Servizi.</p>
        <p className="text-slate-700 mb-8">Il conferimento dei dati per le Finalità di Marketing (punto 2.B) è facoltativo. Puoi quindi decidere di non conferire alcun dato o di negare successivamente la possibilità di trattare dati già forniti.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Diritti dell'Interessato</h2>
        <p className="text-slate-700 mb-2">Nella tua qualità di interessato, hai i diritti di cui agli artt. 15-22 GDPR e precisamente i diritti di:</p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
          <li>Ottenere la conferma dell'esistenza o meno di dati personali che ti riguardano.</li>
          <li>Ottenere l'indicazione: a) dell'origine dei dati; b) delle finalità e modalità del trattamento; c) della logica applicata in caso di trattamento con strumenti elettronici.</li>
          <li>Ottenere: a) l'aggiornamento, la rettificazione ovvero l'integrazione dei dati; b) la cancellazione (diritto all'oblio), la trasformazione in forma anonima o il blocco dei dati trattati in violazione di legge; c) la limitazione del trattamento.</li>
          <li>Opporti, in tutto o in parte, per motivi legittimi, al trattamento dei dati personali che ti riguardano.</li>
          <li>Ricevere i tuoi dati in un formato strutturato, di uso comune e leggibile da dispositivo automatico (diritto alla portabilità).</li>
          <li>Revocare il consenso in qualsiasi momento.</li>
          <li>Proporre reclamo all'Autorità di Controllo (Garante per la Protezione dei Dati Personali).</li>
        </ul>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-800 text-sm">⚠️ Nota Bene: Su tua richiesta, sarà possibile cancellare i dati che ti riguardano e i file presenti sui nostri sistemi. Tuttavia, a causa della natura immutabile della tecnologia, tutte le transazioni e gli hash registrati sulla blockchain non potranno essere rimossi.</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Modalità di Esercizio dei Diritti</h2>
        <p className="text-slate-700 mb-8">Potrai in qualsiasi momento esercitare i tuoi diritti inviando una comunicazione via email all'indirizzo: <a className="text-primary hover:underline" href="mailto:info@simplychain.it">info@simplychain.it</a>.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Cookie Policy</h2>
        <p className="text-slate-700 mb-4">Questa sezione descrive le modalità di gestione dei cookie della Piattaforma e costituisce parte integrante della presente Privacy Policy.</p>
        <h3 className="text-xl font-semibold text-slate-900 mt-2 mb-2">9.1. Cosa sono i Cookie?</h3>
        <p className="text-slate-700 mb-2">I cookie sono piccoli file di testo che i siti visitati inviano al tuo dispositivo, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva. Permettono al sito di ricordare le tue azioni e preferenze (es. login, lingua) per migliorare l'esperienza di navigazione.</p>
        <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">9.2. Tipologie di Cookie Utilizzati</h3>
        <p className="text-slate-700 mb-1"><strong>A) Cookie Tecnici:</strong> Essenziali per il corretto funzionamento del sito. Non richiedono il tuo consenso. Includono cookie di navigazione (cancellati alla chiusura del browser) e di funzionalità (ricordano le tue scelte, come la lingua). Senza questi cookie, la Piattaforma potrebbe non funzionare correttamente.</p>
        <p className="text-slate-700 mb-1"><strong>B) Cookie Analitici:</strong> Utilizzati per raccogliere informazioni in forma aggregata e anonima su come gli utenti visitano il sito. Usiamo strumenti di terze parti (es. Google Analytics) con anonimizzazione dell'IP, assimilando questi cookie a quelli tecnici.</p>
        <p className="text-slate-700 mb-4"><strong>C) Cookie di Profilazione e Marketing:</strong> Allo stato attuale, questa Piattaforma non utilizza cookie di profilazione propri. Se utilizzati in futuro, richiederanno il tuo consenso preventivo.</p>
        <p className="text-slate-700 mb-8"><strong>D) Cookie di Terze Parti:</strong> Durante la navigazione potresti ricevere cookie da altri siti (es. se usi il Social Login con Google). La gestione di questi cookie è disciplinata dalle informative delle terze parti.</p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-2">9.3. Gestione dei Cookie</h3>
        <p className="text-slate-700 mb-8">Puoi gestire le tue preferenze tramite il banner dei cookie mostrato al primo accesso, oppure modificando le impostazioni del tuo browser. Tieni presente che disabilitare i cookie tecnici può compromettere l'utilizzo del sito.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Modifiche a questa Informativa</h2>
        <p className="text-slate-700 mb-8">La presente informativa potrebbe essere soggetta a modifiche. Qualora vengano apportate modifiche sostanziali all'utilizzo dei dati, ti avviseremo pubblicandole con la massima evidenza sulle nostre pagine o tramite email.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Tipologie di Dati Raccolti</h2>
        <p className="text-slate-700 mb-4">
          Raccogliamo diverse tipologie di dati personali per le finalità descritte in questa policy:
        </p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Dati forniti volontariamente dall'Utente:</h3>
        <div className="space-y-4 text-slate-700 ml-4">
          <p><strong>Dati di Registrazione:</strong> Indirizzo email ed eventuali dati forniti tramite account di social media (nome, cognome, immagine del profilo) utilizzati per la creazione dell'Account.</p>
          <p><strong>Dati di Contatto:</strong> Nome, email e altre informazioni che l'Utente fornisce compilando i form di contatto per richiedere informazioni o assistenza.</p>
          <p><strong>Dati Aziendali:</strong> Informazioni relative all'azienda dell'Utente (es. ragione sociale, P.IVA) fornite in fase di registrazione o per la fruizione di servizi dedicati, anche al fine di prevenire abusi e spam.</p>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Dati relativi al contenuto elaborato:</h3>
        <p className="text-slate-700 mb-4">
          Per erogare il servizio di notarizzazione, la Piattaforma calcola un'impronta crittografica (hash) dei file caricati dall'Utente. La Piattaforma non memorizza né analizza il contenuto originale dei file, ma tratta unicamente il loro hash.
        </p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Dati di Navigazione:</h3>
        <p className="text-slate-700 mb-4">
          I sistemi informatici preposti al funzionamento della Piattaforma acquisiscono, nel corso del loro normale esercizio, alcuni dati personali la cui trasmissione è implicita nell'uso dei protocolli di comunicazione di Internet. In questa categoria di dati rientrano gli indirizzi IP, il tipo di browser, il sistema operativo, e altri parametri relativi all'ambiente informatico dell'Utente. Questi dati vengono utilizzati al solo fine di ricavare informazioni statistiche anonime sull'uso del sito e per controllarne il corretto funzionamento.
        </p>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Cookie:</h3>
        <p className="text-slate-700 mb-8">
          La Piattaforma utilizza cookie tecnici e potrebbe utilizzare cookie di analisi e di terze parti. Per informazioni dettagliate, si rimanda alla <a className="text-primary hover:underline" href="/cookie">Cookie Policy</a>.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Finalità e Base Giuridica del Trattamento</h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900">Finalità del Trattamento</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900">Tipologia di Dati Trattati</th>
                <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900">Base Giuridica (GDPR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">A) Erogare i Servizi richiesti</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Dati di Registrazione, Dati Aziendali, Hash dei file</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Art. 6.1.b): Esecuzione di un contratto di cui l'Interessato è parte.</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">B) Rispondere a richieste di informazioni</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Dati di Contatto</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Art. 6.1.b): Esecuzione di misure precontrattuali adottate su richiesta dell'Interessato.</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">C) Garantire la sicurezza della Piattaforma</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Dati di Navigazione, Dati Aziendali</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Art. 6.1.f): Legittimo interesse del Titolare a prevenire frodi e garantire la sicurezza dei propri sistemi.</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">D) Adempiere a obblighi di legge</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Dati Aziendali, Dati di fatturazione</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Art. 6.1.c): Necessità di adempiere un obbligo legale (es. fiscale, contabile).</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">E) Inviare comunicazioni di marketing (Newsletter)</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Indirizzo email</td>
                <td className="border border-slate-300 px-4 py-2 text-slate-700">Art. 6.1.a): Consenso esplicito dell'Interessato (facoltativo e revocabile in qualsiasi momento).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Modalità di Trattamento e Periodo di Conservazione</h2>
        <p className="text-slate-700 mb-4">
          Il trattamento dei dati è effettuato con strumenti informatici e telematici, con logiche strettamente correlate alle finalità indicate e in modo da garantire la sicurezza e la riservatezza dei dati.
        </p>
        <p className="text-slate-700 mb-4">
          I dati saranno conservati per il tempo strettamente necessario a conseguire gli scopi per cui sono stati raccolti:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
          <li>Per le finalità di servizio (punto 3.A), i dati saranno conservati per tutta la durata del rapporto contrattuale e, dopo la cessazione, per 10 anni per adempiere agli obblighi di legge.</li>
          <li>Per le richieste di contatto (punto 3.B), per il tempo necessario a gestire la richiesta.</li>
          <li>Per le finalità di marketing (punto 3.E), fino alla revoca del consenso da parte dell'Utente.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Comunicazione e Trasferimento dei Dati</h2>
        <div className="space-y-4 text-slate-700">
          <p>I dati personali non saranno diffusi. Potranno essere comunicati a soggetti terzi che svolgono attività per conto del Titolare, nominati, se necessario, Responsabili del Trattamento (es. fornitori di servizi cloud, provider di posta elettronica, consulenti tecnici e legali). L'elenco completo dei Responsabili è disponibile su richiesta al Titolare.</p>
          <p>Qualora i dati venissero trasferiti al di fuori dello Spazio Economico Europeo (SEE), il Titolare assicura che il trasferimento avverrà in conformità alle disposizioni di legge applicabili (es. sulla base di decisioni di adeguatezza o clausole contrattuali standard).</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Diritti dell'Interessato</h2>
        <p className="text-slate-700 mb-4">
          In qualità di Interessato, l'Utente può esercitare i diritti previsti dagli artt. 15-22 del GDPR, tra cui:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
          <li><strong>Diritto di accesso:</strong> Ottenere la conferma che sia o meno in corso un trattamento di dati che lo riguardano.</li>
          <li><strong>Diritto di rettifica:</strong> Ottenere la correzione dei dati personali inesatti.</li>
          <li><strong>Diritto alla cancellazione ("diritto all'oblio"):</strong> Ottenere la cancellazione dei propri dati, nei casi previsti dalla legge.</li>
          <li><strong>Diritto di limitazione del trattamento:</strong> Ottenere la limitazione del trattamento al ricorrere di determinate condizioni.</li>
          <li><strong>Diritto alla portabilità dei dati:</strong> Ricevere in un formato strutturato, di uso comune e leggibile, i dati personali forniti.</li>
          <li><strong>Diritto di opposizione:</strong> Opporsi in qualsiasi momento al trattamento dei dati per finalità di marketing o basato sul legittimo interesse.</li>
          <li><strong>Diritto di revoca del consenso:</strong> Revocare il consenso prestato in qualsiasi momento.</li>
        </ul>
        <p className="text-slate-700 mb-4">
          Per esercitare tali diritti, l'Utente può inviare una richiesta all'indirizzo email: <a className="text-primary hover:underline" href="mailto:info@simplychain.it">info@simplychain.it</a>.
        </p>
        <p className="text-slate-700 mb-8">
          L'Utente ha inoltre il diritto di proporre reclamo all'Autorità di controllo competente (per l'Italia, il Garante per la protezione dei dati personali).
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Modifiche a questa Privacy Policy</h2>
        <p className="text-slate-700 mb-8">
          Il Titolare si riserva il diritto di apportare modifiche alla presente Privacy Policy in qualunque momento, dandone pubblicità agli Utenti su questa pagina. Si prega dunque di consultare regolarmente questa pagina, facendo riferimento alla data di ultima modifica indicata in testa.
        </p>
      </div>
    </div>
  </div>
);

export default Privacy;

