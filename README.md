# MOA High-Value Payment SMS Notification System

> **Ministry of Agriculture (MOA)**  
> Real-time executive SMS notification platform triggered whenever Finance records a disbursement exceeding the designated threshold (**20,000,000 ETB**).

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **NestJS 11** (TypeScript) | Modular, enterprise-grade architecture with dependency injection, validation pipes, and JWT auth guards. |
| **Database & ORM** | **PostgreSQL** + **Drizzle ORM** | High-performance, lightweight SQL-like type safety without heavy query engine binaries. |
| **Frontend** | **React 19** + **Vite** + **Tailwind CSS** | Responsive single-page application with real-time threshold warnings and live SMS preview. |
| **SMS Engine** | **Pluggable SMS Provider Adapter** | Supports zero-dependency **Mock Provider** (for dev/testing) and **HTTP On-Premise Gateway Provider**. |
| **Deployment** | **Docker Compose** + **Nginx** | Containerized multi-service setup matching MOA server deployment patterns. |

---

## ⚡ Key Features

1. **Finance Payment Entry Form:**
   - Record voucher reference, beneficiary/payee, amount (ETB), budget category, and payment method.
   - **Real-Time Threshold Detector:** Dynamic UI warning activates whenever amount $\ge 20{,}000{,}000\text{ ETB}$, showing a live preview of the SMS message.
2. **Executive SMS Alert Dispatcher:**
   - Automatically triggers asynchronous SMS dispatch to all active manager phone numbers upon submission.
   - Payments below threshold are recorded quietly without firing alerts.
3. **Pluggable On-Premise SMS Gateway Connector:**
   - Configurable via UI settings or `.env`.
   - Built-in **"Test SMS Connectivity"** tool in the Settings page to verify your on-premise gateway in one click.
   - Non-blocking design: payments are recorded even if the SMS gateway is temporarily unreachable.
4. **SMS Delivery Log & Audit Register:**
   - Complete tracking of message status (`SENT`, `FAILED`, `PENDING`), gateway response codes, timestamps, and retry counts.
   - One-click "Retry" button for failed messages.
5. **Role-Based Access Control:**
   - **Finance Officer:** Records payments, views audit history and delivery logs.
   - **Administrator:** Configures alert threshold amount, manages executive recipient numbers, and configures the SMS gateway.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js $\ge 20$
- PostgreSQL (or Docker)

### 2. Running with Docker Compose (Recommended)
From the root directory:
```bash
docker compose up -d --build
```
- **Web App (Frontend):** [http://localhost:8080](http://localhost:8080)
- **API (Backend):** [http://localhost:3001/api](http://localhost:3001/api)
- **Database (Postgres):** `localhost:5432`

---

### 3. Local Development (Step-by-Step)

#### Start PostgreSQL
If using Docker for Postgres only:
```bash
docker run --name moa-sms-db -e POSTGRES_USER=moa_user -e POSTGRES_PASSWORD=moa_password -e POSTGRES_DB=moa_sms_db -p 5432:5432 -d postgres:16-alpine
```

#### Setup & Start Backend
```bash
cd backend
npm install
npm run drizzle:push    # Pushes Drizzle schema to PostgreSQL
npm run seed            # Seeds default users, settings (20M ETB threshold), and managers
npm run start:dev       # Starts NestJS on http://localhost:3001
```

#### Setup & Start Frontend
```bash
cd frontend
npm install
npm run dev             # Starts Vite development server on http://localhost:5173
```

---

## 🔑 Default Credentials

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `finance` | `finance123` | `FINANCE_OFFICER` | Can record payments and view logs |
| `admin` | `admin123` | `ADMIN` | Full control over threshold, recipients, and gateway |

---

## 📡 On-Premise SMS Gateway Integration Guide

When your network/IT team provides your on-premise SMS gateway details:

1. Log in as `admin`.
2. Navigate to **Settings & Contacts** in the top navigation bar.
3. Switch **SMS Gateway Provider Mode** from `Mock / Console Mode` to `On-Premise Gateway`.
4. Enter the internal gateway URL (e.g., `http://10.10.20.50:8080/api/sms/send`) and API key (if required).
5. Click **"Save Configuration"**.
6. Under **Test SMS Connectivity**, enter a phone number and click **"Send Test"** to verify immediately.

