import React from 'react';

const Terms: React.FC = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Termini e Condizioni Generali di Servizio di SimplyChain</h1>
      <p className="text-slate-600 mb-8">Ultimo aggiornamento: 26/09/2025</p>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-slate-700 mb-8">
          Benvenuto su SimplyChain! I presenti Termini e Condizioni ("Termini") regolano l'accesso e l'utilizzo della piattaforma web SimplyChain ("Piattaforma") e dei servizi offerti ("Servizi"), di proprietà di <strong>SFY srl</strong> ("Titolare").
        </p>
        
        <p className="text-slate-700 mb-8">
          L'utilizzo della Piattaforma, a seguito della registrazione, implica la piena accettazione dei presenti Termini e perfeziona il contratto tra il Titolare e l'Utente. Si prega di leggerli attentamente.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Definizioni</h2>
        <div className="space-y-4 text-slate-700">
          <p><strong>Piattaforma:</strong> Il sito web https://www.simplychain.it/ e la relativa infrastruttura tecnologica.</p>
          <p><strong>Utente:</strong> Qualsiasi persona fisica o giuridica che si registra e utilizza i Servizi offerti dalla Piattaforma.</p>
          <p><strong>Servizi:</strong> Includono, a titolo esemplificativo, la certificazione di hash di documenti su blockchain, la registrazione di informazioni di filiera, la generazione di QR code e l'utilizzo di agenti AI (ove previsto dal piano sottoscritto).</p>
          <p><strong>Certificazione Blockchain:</strong> Il processo tecnico di registrazione di un hash (impronta informatica univoca) di un file su un registro distribuito (blockchain) al fine di garantirne l'esistenza e l'immodificabilità a partire da una certa data e ora.</p>
          <p><strong>Account:</strong> Il profilo univoco creato dall'Utente per accedere ai Servizi.</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Oggetto del Servizio</h2>
        <p className="text-slate-700 mb-4">
          SimplyChain è una piattaforma che offre servizi di registrazione di dati su blockchain in modo semplificato. I Servizi principali includono:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
          <li><strong>Certificazione:</strong> Protezione di documenti, contratti o qualsiasi file digitale tramite la registrazione del loro hash su blockchain.</li>
          <li><strong>Tracciabilità di Filiera:</strong> Creazione di un registro digitale per tracciare passaggi e informazioni lungo una filiera produttiva.</li>
          <li><strong>Generazione di QR Code:</strong> Creazione di QR code collegati alle registrazioni effettuate, da applicare su etichette di prodotti o documenti.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Registrazione, Perfezionamento del Contratto e Gestione dell'Account</h2>
        <div className="space-y-4 text-slate-700">
          <p><strong>3.1.</strong> Per utilizzare i Servizi, l'Utente deve creare un Account, fornendo un indirizzo email o utilizzando un account di social media supportato. L'invio della conferma di registrazione da parte del Titolare all'indirizzo email fornito costituisce il <strong>momento di perfezionamento del contratto</strong>.</p>
          <p><strong>3.2.</strong> L'Utente si impegna a fornire informazioni <strong>veritiere, corrette e aggiornate</strong>, comunicando tempestivamente ogni variazione. Il Titolare si riserva il diritto di sospendere l'accesso ai Servizi qualora le informazioni fornite si rivelino false o incomplete.</p>
          <p><strong>3.3.</strong> Con la registrazione, alla Piattaforma viene associato un <strong>wallet digitale</strong> per conto dell'Utente tramite tecnologia di "account abstraction" per semplificare l'esperienza. L'Utente non detiene né gestisce direttamente asset crittografici per l'utilizzo dei Servizi base.</p>
          <p><strong>3.4.</strong> La custodia delle credenziali di accesso (di seguito, "Chiavi di Accesso") è di <strong>esclusiva responsabilità dell'Utente</strong>, che si impegna a conservarle con la massima diligenza. Qualsiasi attività svolta tramite l'Account sarà considerata effettuata dall'Utente stesso. È vietato cedere a terzi le proprie Chiavi di Accesso.</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Piani, Crediti e Pagamenti</h2>
        <div className="space-y-4 text-slate-700">
          <p><strong>4.1.</strong> Alla prima registrazione, il Titolare offre un <strong>credito promozionale di benvenuto</strong> per testare i Servizi, senza obbligo di acquisto.</p>
          <p><strong>4.2.</strong> L'utilizzo dei Servizi oltre il credito gratuito o l'accesso a funzionalità avanzate richiede la sottoscrizione di un <strong>piano a pagamento</strong>, i cui dettagli sono disponibili nella sezione "Prezzi" del sito.</p>
          <p><strong>4.3.</strong> Il pagamento dei corrispettivi deve avvenire tramite i metodi indicati sulla Piattaforma. In caso di <strong>mancato o ritardato pagamento</strong>, il Titolare ha il diritto di <strong>sospendere immediatamente</strong> i Servizi fino al saldo di quanto dovuto, senza ulteriore preavviso.</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Obblighi dell'Utente</h2>
        <p className="text-slate-700 mb-4">L'Utente si impegna a:</p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
          <li>Utilizzare la Piattaforma in conformità con i presenti Termini e le leggi vigenti.</li>
          <li>Non caricare, registrare o notarizzare contenuti illegali, diffamatori, offensivi, protetti da copyright di terzi (senza averne diritto) o che violino in qualsiasi modo la legge.</li>
          <li>Non utilizzare la Piattaforma per attività di spam, phishing o altre attività fraudolente.</li>
          <li>Non tentare di manomettere, hackerare o compromettere l'integrità della Piattaforma e dei suoi sistemi.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Certificazione su Blockchain: Avvertenze Fondamentali</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-800 font-medium mb-2">⚠️ Avvertenza Importante</p>
          <p className="text-yellow-700 text-sm">
            Il servizio di "certificazione" offerto da SimplyChain è un processo tecnico di marcatura temporale digitale su blockchain. Non costituisce e non sostituisce in alcun modo una certificazione con valore legale eseguita da un pubblico ufficiale (es. un notaio).
          </p>
        </div>
        <div className="space-y-4 text-slate-700">
          <p><strong>6.1.</strong> Il servizio di "certificazione" offerto da SimplyChain è un processo tecnico di marcatura temporale digitale su blockchain. Non costituisce e non sostituisce in alcun modo una certificazione con valore legale eseguita da un pubblico ufficiale (es. un notaio).</p>
          <p><strong>6.2.</strong> L'Utente prende atto che i dati registrati su una blockchain sono, per loro natura, immutabili e permanenti. Una volta eseguita una registrazione, questa non potrà essere rimossa o modificata. Il Titolare non ha alcun controllo sul registro blockchain e non può annullare le transazioni.</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Proprietà Intellettuale</h2>
        <div className="space-y-4 text-slate-700">
          <p><strong>7.1.</strong> Il Titolare è l'unico proprietario di tutti i diritti di proprietà intellettuale relativi alla Piattaforma, al suo software, ai marchi, ai loghi e ai contenuti (esclusi i contenuti caricati dall'Utente).</p>
          <p><strong>7.2.</strong> L'Utente rimane l'unico proprietario dei documenti e dei dati che carica sulla Piattaforma ("Contenuti dell'Utente"). L'Utente concede a SFY srl una licenza limitata, non esclusiva e gratuita, al solo fine di processare tali contenuti per erogare i Servizi richiesti (es. calcolare l'hash, registrarlo su blockchain).</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Limitazione di Responsabilità</h2>
        <div className="space-y-4 text-slate-700">
          <p><strong>8.1.</strong> Il Titolare fornisce i Servizi "così come sono" ("as is"), senza alcuna garanzia di idoneità per scopi specifici.</p>
          <p><strong>8.2.</strong> Il Titolare non è responsabile per i contenuti caricati dagli Utenti sulla Piattaforma né per l'uso che gli Utenti fanno dei Servizi.</p>
          <p><strong>8.3.</strong> Salvo i casi di dolo o colpa grave, il Titolare non potrà essere ritenuto responsabile per danni diretti o indiretti derivanti dall'uso o dal mancato uso della Piattaforma, inclusi malfunzionamenti della rete blockchain o perdite di dati.</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Privacy e Trattamento dei Dati Personali</h2>
        <div className="space-y-4 text-slate-700">
          <p><strong>9.1.</strong> Il Titolare si impegna a proteggere la privacy degli Utenti. I dati personali forniti saranno trattati in conformità al Regolamento (UE) 2016/679 (GDPR).</p>
          <p><strong>9.2.</strong> Per informazioni dettagliate sulle finalità e modalità di trattamento dei dati, si prega di consultare la Privacy Policy della Piattaforma, che costituisce parte integrante dei presenti Termini.</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Sospensione e Chiusura dell'Account</h2>
        <p className="text-slate-700">
          Il Titolare si riserva il diritto di sospendere o chiudere definitivamente un Account, senza preavviso, qualora l'Utente violi i presenti Termini o utilizzi la Piattaforma per scopi illegali o fraudolenti.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Modifiche ai Termini</h2>
        <p className="text-slate-700">
          Il Titolare si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche saranno efficaci dal momento della loro pubblicazione sulla Piattaforma. L'uso continuato dei Servizi dopo tali modifiche costituisce accettazione dei nuovi Termini.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Legge Applicabile e Foro Competente</h2>
        <p className="text-slate-700">
          I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia che dovesse sorgere in merito all'interpretazione o esecuzione dei presenti Termini, sarà competente in via esclusiva il Foro di Milano.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Comunicazioni</h2>
        <p className="text-slate-700 mb-8">
          Per qualsiasi comunicazione relativa ai presenti Termini, l'Utente può contattare il Titolare all'indirizzo email: <a className="text-primary hover:underline" href="mailto:info@simplychain.it">info@simplychain.it</a>.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Titolare del Servizio:</h3>
          <p className="text-slate-700">
            <strong>SFY srl</strong><br />
            Via [Indirizzo completo]<br />
            [CAP] [Città] (MI)<br />
            P.IVA: [Numero Partita IVA]<br />
            Email: <a className="text-primary hover:underline" href="mailto:info@simplychain.it">info@simplychain.it</a>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Terms;

