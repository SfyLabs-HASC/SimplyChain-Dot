<div align="center">
  <img alt="SimplyChain Logo" src="public/favicon.svg" width="120" />
  
  <h1>SimplyChain</h1>
  <p><strong>Blockchain certification for supply chains and documents.</strong></p>
</div>

## Overview

SimplyChain is a modern web application that enables companies to:

- Register and activate a company profile to access on‑chain certification services
- Certify supply chain steps on Polygon, generating a transparent and immutable audit trail
- Notarize documents by anchoring their SHA‑256 hash on-chain
- Manage and recharge credits via Stripe, with automatic balance updates and email confirmations

All flows are optimized for Italian businesses (billing fields, CF/SDI/PEC validation) and include a smooth thirdweb‑powered login experience.

## Preview

<p>
  <img alt="SimplyChain mark" src="public/favicon.svg" width="80" />
</p>

- Hero video (demo): `public/hero.mp4`

## Key Features

- Company registration with admin approval
- Credit wallet with Stripe checkout and idempotent webhooks
- On‑chain certification of production steps (Polygon)
- Document notarization (SHA‑256 hashing + on‑chain proof)
- Admin panel to manage companies and credits
- Branded transactional emails (Resend)

## Getting Started

Prerequisites: Node.js LTS

1) Install dependencies
```bash
npm install
```

2) Run the app locally
```bash
npm run dev
```

## Tech Stack

- Vite + React + TypeScript
- thirdweb (wallet, contract calls)
- Stripe (checkout, webhooks)
- Firebase Admin + Firestore
- Resend (email)
- Tailwind CSS

## Deployment

The app is configured for Vercel. Production builds are triggered from the `main` branch.

## Contact

For inquiries and support: `sfy.startup@gmail.com`
