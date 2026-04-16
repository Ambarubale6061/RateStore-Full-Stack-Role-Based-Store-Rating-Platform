# ⭐ RateStore — Store Rating Application

A full-stack web application where users can browse stores and submit star ratings, store owners can monitor their store's performance, and administrators manage the entire platform.

---

## Overview

RateStore is a three-role platform built with a Node.js/Express REST API backend and a React frontend. Regular users browse and rate stores on a 1–5 star scale, store owners view ratings and analytics for their assigned store, and admins manage the full user and store catalogue from a dedicated dashboard.

---

## Features

### 👤 User (Regular)

- Sign up and log in with email/password
- Browse all stores with search, sort (name / avg rating), and pagination
- Submit a star rating (1–5) for any store
- Update a previously submitted rating
- View all personal ratings with store averages
- Change account password

### 🏪 Store Owner

- View their assigned store's overview (name, address, image)
- See overall average rating and total review count
- Interactive rating breakdown bar chart (5★ → 1★ distribution)
- Browse individual customer reviews with reviewer name, email, and date

### 🔐 Admin

- Separate login portal (`/adminlogin`) — admins cannot log in via the public login page
- Dashboard statistics: total users, stores, and ratings
- User management: list, filter, sort, paginate, view detail, and create users of any role
- Store management: list, filter, sort, paginate, and create stores
- Upload, replace, and delete store images (stored in Supabase Storage)
- Assign stores to store owner accounts

---

## Tech Stack

| Layer            | Technology                                           |
| ---------------- | ---------------------------------------------------- |
| Frontend         | React 18, React Router v6, Tailwind CSS, Axios       |
| Backend          | Node.js, Express 4                                   |
| Database         | PostgreSQL (hosted on Supabase)                      |
| File Storage     | Supabase Storage                                     |
| Authentication   | JSON Web Tokens (JWT)                                |
| Password Hashing | bcryptjs                                             |
| Validation       | express-validator (backend), custom hooks (frontend) |
| ORM/Query        | node-postgres (`pg`)                                 |

---

## Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # PostgreSQL pool configuration
│   │   │   └── storage.js         # Supabase Storage helpers (upload/delete)
│   │   ├── controllers/
│   │   │   ├── adminController.js  # Admin login, stats, user & store CRUD
│   │   │   ├── authController.js   # Signup, login, getMe, changePassword
│   │   │   ├── ratingController.js # Submit, update, list ratings
│   │   │   └── storeController.js  # Public store listing & detail
│   │   ├── middlewares/
│   │   │   ├── auth.js             # verifyToken, requireRole
│   │   │   ├── errorHandler.js     # Global error handler
│   │   │   ├── upload.js           # Multer memory storage config
│   │   │   └── validate.js         # express-validator result handler
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── ratingRoutes.js
│   │   │   └── storeRoutes.js
│   │   └── server.js              # Express app entry point
│   ├── package.json
│   └── schema.sql                 # Database schema + seed admin user
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── FormField.jsx       # Reusable labeled input with error display
    │   │   ├── LoadingSpinner.jsx  # Full-page or inline loading indicator
    │   │   ├── Modal.jsx           # Generic modal wrapper
    │   │   ├── Navbar.jsx          # Top navigation bar
    │   │   ├── Pagination.jsx      # Page controls component
    │   │   └── StarRating.jsx      # Interactive & display-only star rating
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state (user, login, logout)
    │   ├── hooks/
    │   │   └── useValidation.js    # Client-side form validation helpers
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminLoginPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── StoreListPage.jsx
    │   │   └── StoreOwnerDashboard.jsx
    │   ├── services/
    │   │   └── api.js              # Axios instance with JWT interceptors
    │   ├── App.js                  # Route definitions & protected route guards
    │   └── index.js
    ├── package.json
    ├── postcss.config.js
    └── tailwind.config.js
```

---

## Database Schema

Three tables backed by PostgreSQL (hosted on Supabase):

```
users
  id          UUID (PK)
  name        VARCHAR(60)       — 20–60 characters
  email       VARCHAR(255)      — unique
  password    TEXT              — bcrypt hash
  address     VARCHAR(400)
  role        ENUM              — 'ADMIN' | 'USER' | 'STORE_OWNER'
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ

stores
  id          UUID (PK)
  name        VARCHAR(255)
  email       VARCHAR(255)
  address     VARCHAR(400)
  image_url   TEXT              — Supabase Storage public URL
  owner_id    UUID (FK → users) — ON DELETE SET NULL
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ

ratings
  id          UUID (PK)
  user_id     UUID (FK → users)  — ON DELETE CASCADE
  store_id    UUID (FK → stores) — ON DELETE CASCADE
  rating      INTEGER            — CHECK 1–5
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ
  UNIQUE (user_id, store_id)     — one rating per user per store
```

All three tables have auto-updating `updated_at` triggers.

---

## API Reference

Base URL (local): `http://localhost:5000/api`

### Auth — `/api/auth`

| Method | Endpoint           | Auth         | Description                       |
| ------ | ------------------ | ------------ | --------------------------------- |
| POST   | `/signup`          | Public       | Register a new USER account       |
| POST   | `/login`           | Public       | Log in (USER or STORE_OWNER only) |
| GET    | `/me`              | Bearer token | Get current user profile          |
| PUT    | `/change-password` | Bearer token | Update password                   |

#### Validation rules (signup & user creation)

- `name` — 20–60 characters
- `email` — valid email
- `password` — 8–16 characters, at least one uppercase letter, at least one special character
- `address` — optional, max 400 characters

---

### Admin — `/api/admin`

| Method | Endpoint            | Auth   | Description                                            |
| ------ | ------------------- | ------ | ------------------------------------------------------ |
| POST   | `/login`            | Public | Admin-only login                                       |
| GET    | `/stats`            | ADMIN  | Total user / store / rating counts                     |
| GET    | `/users`            | ADMIN  | List users (filter: name, email, role; sort; paginate) |
| GET    | `/users/:id`        | ADMIN  | Get single user with store & rating info               |
| POST   | `/users`            | ADMIN  | Create a user of any role                              |
| GET    | `/stores`           | ADMIN  | List stores (filter: name, address; sort; paginate)    |
| POST   | `/stores`           | ADMIN  | Create a store (optional image upload)                 |
| PUT    | `/stores/:id/image` | ADMIN  | Replace store image                                    |
| DELETE | `/stores/:id/image` | ADMIN  | Remove store image                                     |

---

### Stores — `/api/stores`

| Method | Endpoint | Auth             | Description                                       |
| ------ | -------- | ---------------- | ------------------------------------------------- |
| GET    | `/`      | Optional (token) | List stores; logged-in users see their own rating |
| GET    | `/:id`   | Optional (token) | Get store detail with ratings                     |

Query params for listing: `search`, `page`, `limit`, `sortBy` (`name` \| `address` \| `avg_rating` \| `created_at`), `order` (`asc` \| `desc`)

---

### Ratings — `/api/ratings`

| Method | Endpoint | Auth        | Description                                    |
| ------ | -------- | ----------- | ---------------------------------------------- |
| POST   | `/`      | USER        | Submit a rating for a store                    |
| PUT    | `/`      | USER        | Update an existing rating                      |
| GET    | `/mine`  | USER        | List all ratings submitted by the current user |
| GET    | `/store` | STORE_OWNER | Get all ratings for the owner's assigned store |

Body for POST/PUT: `{ "store_id": "<uuid>", "rating": 1–5 }`

---

### Health Check

```
GET /api/health  →  { "status": "ok", "timestamp": "..." }
```

---

## Role-Based Access Control

```
Route               USER    STORE_OWNER    ADMIN
─────────────────────────────────────────────────────
/login               ✓          ✓            ✗ (use /adminlogin)
/adminlogin          ✗          ✗            ✓
/signup              ✓          ✗            ✗
/stores              ✓          ✗            ✓
/owner               ✗          ✓            ✗
/admin               ✗          ✗            ✓
```

Store owners are never created via public signup — they are created exclusively by an Admin through the admin dashboard or API, then a store is assigned to them.

The JWT payload contains `{ id, email, role, name }`. All protected routes verify the token on every request and check `role` before proceeding.

---

## Local Setup & Installation

### Prerequisites

- Node.js v18+
- A Supabase project (free tier works) with:
  - A PostgreSQL database (schema applied via `schema.sql`)
  - A Storage bucket named `store-images` set to **public**

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/store-rating-app.git
cd store-rating-app
```

---

### 2. Set up the database

Open your Supabase project → SQL Editor → paste and run the full contents of `backend/schema.sql`. This creates the three tables, indexes, triggers, and inserts the default admin user.

---

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

```bash
npm install
npm run dev        # starts on http://localhost:5000
```

---

### 4. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm install
npm start          # starts on http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Supabase PostgreSQL (Settings → Database → Connection parameters)
DB_HOST=db.<your-project-ref>.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_db_password

# Supabase Storage (Settings → API)
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage bucket (must match name created in Supabase Storage dashboard)
SUPABASE_STORAGE_BUCKET=store-images

# CORS — set to your frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

> ⚠️ **Never commit `.env` files to version control.** Both are already in `.gitignore`.

---

## Default Credentials

> ⚠️ These credentials are seeded by `schema.sql`. **Change the password immediately after your first login.**

| Field          | Value                   |
| -------------- | ----------------------- |
| **Login page** | `/adminlogin`           |
| **Email**      | `admin@storerating.com` |
| **Password**   | `password`              |

---
