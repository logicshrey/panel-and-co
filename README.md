# Panel & Co.

MERN starter for the Panel & Co. storefront: React + Vite + Tailwind on the client, Node + Express + Mongoose on the server.

```
panel-and-co/
├── client/          # React (Vite) + Tailwind
└── server/          # Express API + Mongoose models
```

## Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free M0 tier is enough)

## Setup

### 1. Install dependencies

From the repo root:

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Configure MongoDB

Copy the example env file and add your Atlas connection string:

```bash
cp server/.env.example server/.env
```

On Windows (PowerShell):

```powershell
Copy-Item server/.env.example server/.env
```

Edit `server/.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/panel-and-co?retryWrites=true&w=majority
```

Replace the placeholder with your real Atlas URI. The API still starts if `MONGO_URI` is unset; `/api/health` will report the database as disconnected.

### 3. Run locally

From the repo root (client + server together):

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

The Vite dev server proxies `/api` to the Express server.

## Health check

```bash
curl http://localhost:5000/api/health
```

Expected:

```json
{ "ok": true, "service": "panel-and-co", "mongodb": "connected" }
```

## Scripts

| Location | Command | What it does |
| --- | --- | --- |
| Root | `npm run dev` | Client (Vite) + server (nodemon) |
| `server` | `npm run dev` | Express with nodemon |
| `server` | `npm start` | Express without nodemon |
| `client` | `npm run dev` | Vite HMR |
| `client` | `npm run build` | Production build |

## Data models

Mongoose schemas live in `server/models/`:

- **User** — name, email, password_hash, role (`customer` \| `admin`)
- **Faction** — name, slug, palette, description, bannerImage
- **Product** — name, factionId, description, basePrice, images
- **Variant** — productId, size, color, stock, sku
- **Order** — userId, total, status, createdAt
- **OrderItem** — orderId, variantId, qty, price
- **ShopSession** — hostUserId, code, active, createdAt
- **SessionMember** — sessionId, displayName, userId (nullable for guests), joinedAt
- **SharedCartItem** — sessionId, variantId, qty, addedBy
