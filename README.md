# Smart Expense Tracker

A full-stack financial tracking application built with **React (Vite)** on the frontend, **Node.js / Express** on the backend, and **MySQL** for data persistence.

---

## 🌐 Live Production Deployments

* **Frontend (Vercel)**: [https://expense-tracker-sigma-ruddy-58.vercel.app](https://expense-tracker-sigma-ruddy-58.vercel.app)
* **Backend API (Render)**: [https://expensetracker-2-vqht.onrender.com](https://expensetracker-2-vqht.onrender.com)
* **Cloud Database (Aiven)**: Managed MySQL 8 Service (SSL Enforced)
* **Continuous Integration (CI)**: GitHub Actions Automated Build & Lint Pipeline

---

## 🏗️ Architecture & Technology Stack

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT SIDE (React Frontend)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Pages Layer   │  │ Component Layer │  │ Service Layer   │                  │
│  │                 │  │                 │  │                 │                  │
│  │ • Dashboard.jsx │  │ • ExpenseForm   │  │ • API Service   │                  │
│  │ • Login.jsx     │  │ • ExpenseTable  │  │ • Context       │                  │
│  │ • Register.jsx  │  │ • Charts        │  │ • Utils         │                  │
│  │ • Home.jsx      │  │ • Managers     │  │                 │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
│           │                       │                       │                     │
│           └───────────────────────┼───────────────────────┘                     │
│                                   │                                             │
├───────────────────────────────────┼─────────────────────────────────────────────┤
│                                   │                                             │
│                        HTTP/HTTPS API Requests (REST)                           │
│                                   │                                             │
│                                   ▼                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                            SERVER SIDE (Node.js Backend)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Routes Layer  │  │ Controller Layer│  │  Middleware     │                  │
│  │                 │  │                 │  │                 │                  │
│  │ • authRoutes    │  │ • authController│  │ • authMiddleware│                  │
│  │ • expenseRoutes │  │ • expenseCtrl   │  │ • Dynamic CORS  │                  │
│  │ • categoryRoutes│  │ • categoryCtrl  │  │ • Body Parser   │                  │
│  │ • budgetRoutes  │  │ • budgetCtrl    │  │                 │                  │
│  │ • recurringRoute│  │ • recurringCtrl │  │                 │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
│           │                       │                       │                     │
│           └───────────────────────┼───────────────────────┘                     │
│                                   │                                             │
├───────────────────────────────────┼─────────────────────────────────────────────┤
│                                   │                                             │
│                         Business Logic & Data Access Layer                      │
│                                   │                                             │
│                                   ▼                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              DATA ACCESS LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Model Layer   │  │ Database Config │  │    Database     │                  │
│  │                 │  │                 │  │                 │                  │
│  │ • userModel     │  │ • db.js         │  │ • Aiven MySQL   │                  │
│  │ • expenseModel  │  │ • SSL Support   │  │ • Local MySQL   │                  │
│  │ • categoryModel │  │ • Custom Ports  │  │ • 6 Tables      │                  │
│  │ • budgetModel   │  │                 │  │                 │                  │
│  │ • recurringModel│  │                 │  │                 │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

* **Frontend**: React 19, Vite, Tailwind CSS, Chart.js, Axios, React Router v7, PWA
* **Backend**: Node.js v22, Express.js v5, mysql2 (Promise-based), JWT Authentication, bcryptjs
* **Database**: MySQL 8 (Local Workbench instance & Cloud Aiven MySQL)
* **Cloud Infrastructure**: Vercel (Frontend), Render (Backend Web Service), Aiven (Cloud MySQL)
* **CI Pipeline**: GitHub Actions (`.github/workflows/ci.yml`)

---

## 🚀 Cloud Deployment Summary (What Was Implemented)

### 1. Security & Environment Protection
* Protected local `.env` database credentials by updating root and server `.gitignore`.
* Removed `.env` from Git tracking cache using `git rm --cached` without deleting local files.
* Created clean blueprint templates (`server/.env.example` and `client/.env.example`) with zero exposed secrets.

### 2. Cloud-Ready Backend (Render)
* Configured port binding to `0.0.0.0` with `process.env.PORT` fallback.
* Enhanced `server/config/db.js` with `DB_PORT` and `DB_SSL` support for Aiven while preserving local development.
* Added a health check endpoint (`GET /`) returning `{"message":"Expense Tracker API is running"}`.

### 3. Dynamic CORS Security
* Replaced wildcard `*` with dynamic origin validation in `server/server.js`.
* Allowed production Vercel frontend (`CLIENT_URL`) while keeping local development (`localhost:5173`, `localhost:3000`) enabled.

### 4. Production React & Vite (Vercel)
* Configured `VITE_API_BASE_URL` with automatic `/api` route normalization.
* Added `client/vercel.json` SPA rewrite rules to prevent 404 errors on browser page reloads.
* Resolved Vite 8 / `vite-plugin-pwa` peer dependency conflicts using `.npmrc` and dependency overrides.

### 5. Automated CI Pipeline (GitHub Actions)
* Added `.github/workflows/ci.yml` running on every push and pull request to `main`.
* Automates dependency installation (`npm ci`) and client production builds (`npm run build`).

### 6. Cloud Database Migration (Aiven MySQL)
* Exported local database schema and data via MySQL Workbench to `expense_tracker_dump.sql`.
* Imported data cleanly into Aiven Managed MySQL (`defaultdb`) over SSL.

---

## 💻 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Mahadev1729/ExpenseTracker.git
cd ExpenseTracker
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file inside `server/` (refer to `.env.example`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_password
DB_NAME=expense_tracker
DB_SSL=false

JWT_SECRET=your_jwt_secret_key
```
Start the server:
```bash
npm run dev
# Server running on port 5000
# MySQL Connected
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Tables
1. `users` — Authentication credentials and profiles.
2. `categories` — Custom expense categories with color and icon tags.
3. `expenses` — Expense records, amounts, dates, and notes.
4. `budgets` — Spending thresholds and category limits.
5. `recurring_expenses` — Subscriptions and recurring bills.
6. `notifications` — Dynamic in-app budget alerts and reminders.
