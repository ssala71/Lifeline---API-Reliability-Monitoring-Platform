# Lifeline Frontend

React, TypeScript, and Vite dashboard for the Lifeline API.

## Setup

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173`. It expects FastAPI to be
running at `http://127.0.0.1:8000`. To use another API URL, create
`frontend/.env.local` with:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Checks

```powershell
npm run test
npm run build
npm run lint
```
