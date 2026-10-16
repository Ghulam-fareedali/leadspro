# 🚀 OmniFlow CRM — Customer & Lead Management System

A production-grade, full-stack Customer Ingestion & Lead Pipeline Management Dashboard built with **React**, **Vite**, **Tailwind CSS**, and a **Node.js/Express Serverless Backend** configured for seamless deployment on **Vercel** with persistent **MongoDB Atlas** database support.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![Node](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

---

## 🌟 Key Features

### 1. The Raw Data Pool (Customer Ingestion)
- **Real Excel / CSV Upload:** Powered by SheetJS (`xlsx`). Drag-and-drop or file selector with live 5-row preview and intelligent column auto-mapping.
- **Bulk & Filtered Selection:** Select all, filter unassigned only, or filter assigned only.
- **Batch Routing:** Assign 10, 50, or 100+ customers to sales agents in one click.
- **Permanent Data Deletion:** 
  - Single record deletion with confirmation modal.
  - Bulk selected deletion.
  - **"Delete All Records"** one-click wipe that cleans both the Customer pool and linked active pipeline leads from the database.
- **Excel Export:** Export filtered or full customer pool back into `.xlsx`.

### 2. Actionable Leads Pipeline
- **Kanban-Style Status Tracking:** `Pending`, `Connected`, `Interested` (Hot Leads), and `Not Interested`.
- **Interactive Inline Status Dropdowns:** Instantly change lead stage with real-time analytics sync.
- **Smart Filtering:** Quick tabs by lead status, agent, or global text search.
- **Row Deletion:** Remove leads with automatic status updates.

### 3. Dynamic Analytics & Pipeline Funnel
- Real-time KPI summary (Total Customers, Total Leads, Interest Rate, Unassigned Count).
- Multi-segment visual pipeline funnel progression bar.
- Sales agent workload matrix with individual conversion percentages.

### 4. Custom Team Management
- Add custom team members with auto-assigned avatars and roles.
- Edit/rename team member details with automatic sync across assigned customers and leads.
- Safe member removal: Deleting an agent safely returns all their assigned customers back to the unassigned pool.

---

## ☁️ Full-Stack Deployment on Vercel

Everything (Frontend, Serverless Express API, and Database Connection) is pre-configured to run directly on **Vercel**.

### Step 1: Deploy to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Select and import the repository **`leadspro`**.
3. Keep default settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 2: Connect Database directly inside Vercel
You can connect MongoDB Atlas in 2 clicks right inside your Vercel Dashboard:
1. In your Vercel Project dashboard, click the **Storage** tab.
2. Click **Connect Store** and select **MongoDB Atlas**.
3. Follow the prompt to connect your free MongoDB Atlas database.
4. Vercel will automatically set the `MONGODB_URI` environment variable and trigger a zero-downtime redeploy!

*(Alternatively, add `MONGODB_URI` manually under Project Settings → Environment Variables).*

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ghulam-fareedali/leadspro.git
   cd leadspro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/leadspro?retryWrites=true&w=majority
   PORT=5000
   ```

4. **Start the Backend API:**
   ```bash
   npm run server
   ```

5. **Start the Vite Frontend:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔌 API Endpoints (Vercel Serverless & Express)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & database connection status |
| `GET` | `/api/customers` | Fetch all customers in raw pool |
| `POST` | `/api/customers` | Add single customer |
| `POST` | `/api/customers/bulk` | Ingest multiple customers from Excel upload |
| `POST` | `/api/customers/assign` | Assign selected customer IDs to an agent |
| `POST` | `/api/customers/unassign` | Revert assigned customers back to pool |
| `DELETE` | `/api/customers/bulk` | Delete selected customer records |
| `DELETE` | `/api/customers/all` | Wipe all customer records and linked leads |
| `DELETE` | `/api/customers/:id` | Delete single customer |
| `GET` | `/api/leads` | Fetch all leads in active pipeline |
| `PUT` | `/api/leads/:id/status` | Update lead status (`Pending`, `Connected`, `Interested`, `Not Interested`) |
| `DELETE` | `/api/leads/:id` | Delete single lead |
| `GET` | `/api/agents` | Fetch all team members |
| `POST` | `/api/agents` | Create new team member |
| `PUT` | `/api/agents/:id` | Update team member name/role |
| `DELETE` | `/api/agents/:id` | Delete member & return leads to pool |
| `GET` | `/api/stats` | Aggregated dashboard KPI metrics |
