# Pharmacy Manager Android

A practical Android-ready pharmacy management application starter built as a monorepo with:

- Backend API: Node.js + Express + TypeScript
- Mobile app: React Native + Expo
- Pharmacy workflows: inventory, sales, prescription tracking, alerts, reports

## Project structure

```text
pharmacy-manager-android/
├─ backend/
│  ├─ src/
│  ├─ package.json
│  └─ tsconfig.json
├─ mobile/
│  ├─ App.tsx
│  ├─ app.json
│  ├─ package.json
│  └─ tsconfig.json
├─ package.json
├─ .gitignore
└─ README.md
```

## Features

- Product catalog with stock management
- Inventory alerts for low-stock products
- Sales recording and revenue calculations
- Prescription tracking and status updates
- Dashboard summary and reports
- Android-ready Expo app UI
- In-memory demo backend for local development

## Quick start

### 1) Install root dependencies

```bash
npm install
```

### 2) Start the backend

```bash
npm run backend
```

### 3) Start the mobile app

In a new terminal:

```bash
npm run mobile
```

Then press `a` to launch Android emulator/device if configured.

## Backend API

The API runs on `http://localhost:4000` by default.

Example endpoints:

```bash
curl http://localhost:4000/api/dashboard
curl http://localhost:4000/api/products
curl http://localhost:4000/api/sales
curl http://localhost:4000/api/alerts
```

## Mobile app notes

- For Android Emulator, use `10.0.2.2` in the app's API base URL.
- The default app fetches dashboard data from the backend when available.
- If the backend is not running, it falls back to sample in-app data.

## Recommended next steps

- Connect app to real backend API and real database
- Add authentication and user roles
- Add barcode scanner integration
- Add receipt printing and PDF export
- Add offline caching / local persistence

## License

MIT
