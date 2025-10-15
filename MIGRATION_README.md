# Migrazione da ThirdWeb/Arbitrum a NeuroWeb/Polkadot

## Panoramica delle Modifiche

Questo progetto è stato migrato da ThirdWeb SDK con Arbitrum a un sistema di autenticazione Firebase con supporto per transazioni Polkadot/NeuroWeb.

## Modifiche Principali

### 1. Sistema di Autenticazione
- **Prima**: Autenticazione tramite wallet (MetaMask) con ThirdWeb
- **Dopo**: Autenticazione Firebase con email/password e Google OAuth
- **Admin**: Accesso con email `sfy.startup@gmail.com` e password `1234`
- **Test Company**: Accesso con email `pianopkeys@gmail.com` e password `1234`

### 2. Database
- **Prima**: Contratti smart su Arbitrum
- **Dopo**: Firestore per gestione utenti e aziende

### 3. Transazioni Blockchain
- **Prima**: ThirdWeb SDK per Arbitrum
- **Dopo**: Polkadot API per transazioni su NeuroWeb

## Configurazione

### 1. Variabili d'Ambiente
Crea un file `.env` basato su `.env.example`:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Polkadot/NeuroWeb Configuration
VITE_POLKADOT_RPC_URL=wss://rpc.polkadot.io
VITE_BACKEND_WALLET_ADDRESS=your_backend_wallet_address
VITE_BACKEND_WALLET_PRIVATE_KEY=your_backend_wallet_private_key
```

### 2. Setup Firebase
1. Crea un progetto Firebase
2. Abilita Authentication (Email/Password e Google)
3. Crea un database Firestore
4. Configura le regole di sicurezza

### 3. Setup Dati di Test
Esegui lo script per creare i dati di test:

```bash
node scripts/setup-test-data.js
```

## Nuove Funzionalità

### 1. Sistema di Registrazione
- Form di registrazione per nuove aziende
- Approvazione manuale da parte dell'admin
- Gestione stati: pending, active, inactive

### 2. Admin Panel
- Gestione aziende e richieste di attivazione
- Modifica crediti e informazioni aziende
- Attivazione/disattivazione account

### 3. Transazioni Polkadot
- Servizio per transazioni su blockchain Polkadot
- Supporto per Knowledge Assets (quando disponibile)
- Modale con dettagli transazione

## Struttura File Modificati

### Nuovi File
- `src/firebase.ts` - Configurazione Firebase
- `src/contexts/AuthContext.tsx` - Context per autenticazione
- `src/services/polkadotService.ts` - Servizio per transazioni Polkadot
- `src/hooks/usePolkadot.ts` - Hook per transazioni
- `components/LoginForm.tsx` - Form di login
- `components/RegistrationForm.tsx` - Form di registrazione
- `components/AdminLoginForm.tsx` - Form login admin
- `components/TransactionModal.tsx` - Modale transazioni
- `pages/Login.tsx` - Pagina di login/registrazione

### File Modificati
- `App.tsx` - Aggiunto AuthProvider
- `components/Header.tsx` - Nuovo sistema di navigazione
- `components/AuthEffects.tsx` - Gestione redirect con Firebase
- `pages/Form.tsx` - Integrazione con Firebase
- `pages/SfyAdmin.tsx` - Nuovo admin panel
- `package.json` - Dipendenze aggiornate

## Dipendenze

### Rimosse
- `thirdweb` - Sostituito con Firebase e Polkadot

### Aggiunte
- `firebase` - Autenticazione e database
- `@polkadot/api` - API Polkadot
- `@polkadot/util` - Utility Polkadot
- `@polkadot/util-crypto` - Crittografia
- `@polkadot/wasm-crypto` - WASM crypto
- `@polkadot/keyring` - Gestione chiavi

## Note per il Deploy

1. **Vercel**: Configura le variabili d'ambiente nel dashboard Vercel
2. **Firebase**: Assicurati che le regole di sicurezza Firestore permettano l'accesso
3. **CORS**: Configura CORS per le API Firebase se necessario

## Prossimi Passi

1. Implementare il supporto completo per NeuroWeb SDK quando disponibile
2. Aggiungere supporto per step infiniti nelle iscrizioni
3. Implementare notifiche email per attivazioni
4. Aggiungere supporto per più reti Polkadot

## Supporto

Per problemi o domande sulla migrazione, contatta il team di sviluppo.