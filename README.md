# RateStore — Full-Stack Store Rating Application

A production-ready store rating platform built with React, Node.js/Express, and PostgreSQL (via Supabase).

---

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router v6, Axios
- **Backend**: Node.js, Express.js, JWT authentication, bcryptjs
- **Database**: PostgreSQL (hosted on Supabase)

---

## Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # PostgreSQL pool config
│   │   ├── controllers/          # Business logic
│   │   ├── middlewares/          # Auth, validation, error handling
│   │   └── routes/               # API route definitions
│   ├── schema.sql                # Database schema (run in Supabase)
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/           # Reusable UI components
    │   ├── context/              # React context (Auth)
    │   ├── hooks/                # Custom hooks & validation
    │   ├── pages/                # Page-level components
    │   └── services/             # Axios API client
    └── package.json
```

---

## Setup Instructions

### 1. Supabase Database Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Navigate to **SQL Editor** in the dashboard
3. Copy the contents of `backend/schema.sql` and run it
4. Go to **Settings → Database** to get your connection credentials

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PORT=5000
JWT_SECRET=change_this_to_a_random_string
JWT_EXPIRES_IN=7d

DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_db_password

FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev    # development with nodemon
npm start      # production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

---

## Default Admin Account

After running the schema, a default admin is created:

- **Email**: admin@storerating.com
- **Password**: Admin@123

> ⚠️ Change this password immediately in production!

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user (USER role) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Authenticated | Get current user info |
| PUT | `/api/auth/change-password` | Authenticated | Change password |

### Admin (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats (users, stores, ratings counts) |
| GET | `/api/admin/users` | List users (filters: name, email, role; sortable; paginated) |
| GET | `/api/admin/users/:id` | Get single user details |
| POST | `/api/admin/users` | Create user (any role) |
| GET | `/api/admin/stores` | List stores with avg rating (filters: name, address) |
| POST | `/api/admin/stores` | Create store |

### Stores (public with optional auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List stores (search, sort, pagination; includes user's rating if logged in) |
| GET | `/api/stores/:id` | Get store details |

### Ratings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/ratings` | USER | Submit rating (1–5) |
| PUT | `/api/ratings` | USER | Update existing rating |
| GET | `/api/ratings/mine` | USER | Get current user's ratings |
| GET | `/api/ratings/store` | STORE_OWNER | Get ratings for owner's store |

---

## Form Validation Rules

| Field | Rules |
|-------|-------|
| Name | 20–60 characters |
| Email | Valid email format |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special character |
| Address | Max 400 characters |
| Rating | Integer 1–5 |

Validation is enforced on both frontend (React) and backend (express-validator).

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **ADMIN** | Full access — manage users, stores, view all data |
| **USER** | Browse stores, submit and update ratings |
| **STORE_OWNER** | View their own store's ratings and average score |

---

## Environment Variables

### Backend `.env`
```
PORT                 # Server port (default: 5000)
JWT_SECRET           # Secret key for JWT signing
JWT_EXPIRES_IN       # Token expiry (e.g. 7d)
DB_HOST              # Supabase PostgreSQL host
DB_PORT              # DB port (5432)
DB_NAME              # Database name (postgres)
DB_USER              # DB user (postgres)
DB_PASSWORD          # DB password
FRONTEND_URL         # Frontend origin for CORS
```

### Frontend `.env`
```
REACT_APP_API_URL    # Backend API URL
```

---

## Notes

- Supabase is used **only as a PostgreSQL host** — no Supabase Auth or Storage is used
- All authentication is handled via custom JWT in Express
- SSL is required for Supabase connections (`rejectUnauthorized: false` is set)
- Passwords are hashed with bcrypt (10 salt rounds)

---

## Supabase Storage Setup

This app uses **Supabase Storage** for store images. Authentication still uses custom JWT — only storage is delegated to Supabase.

### 1. Create a Storage Bucket

In the Supabase Dashboard → **Storage → New Bucket**:
- **Name**: `store-images`
- **Public**: ✅ Yes (so image URLs work without auth tokens)

### 2. Set Bucket Policies

Add a policy for public reads:
- **Name**: Allow public read
- **Operation**: SELECT
- **USING expression**: `true`

### 3. Add env variables

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=store-images
```

Get these from: **Supabase Dashboard → Settings → API**

> ⚠️ Use the **service role key** (not the anon key) — it's used server-side only and never exposed to the frontend.

### How it works

- Admin uploads an image when creating/editing a store → sent to Express via `multipart/form-data`
- Express receives the file buffer via `multer` (memory storage, no disk writes)
- The buffer is uploaded to Supabase Storage using `@supabase/supabase-js` (storage API only)
- The returned public URL is stored in the `stores.image_url` column in PostgreSQL
- Frontend displays images directly from the Supabase CDN URL

### Image API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/stores` | Create store (accepts optional `image` file field) |
| PUT | `/api/admin/stores/:id/image` | Replace store image |
| DELETE | `/api/admin/stores/:id/image` | Remove store image |

File constraints: JPEG, PNG, WebP, GIF — max 5MB.
