# Visitor Pass Management System

A submission-ready MERN assignment project for digitizing visitor registration, appointment approval, QR-based pass issuance, and front-desk check-in/check-out.

## Highlights

- JWT authentication with role-based access (`admin`, `security`, `employee`, `visitor`)
- Visitor pre-registration with contact details and photo URL support
- Appointment creation and approval workflow
- QR-code pass generation plus PDF badge creation on the backend
- Check-in/check-out logging and CSV export
- Multi-organization-ready data model using `organizationId`
- Seed data for quick demo setup
- Docker Compose setup as a bonus deliverable

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express + MongoDB + Mongoose
- Auth: JWT + bcrypt
- Utilities: QRCode + PDFKit

## Project Structure

```text
.
├── backend
├── frontend
├── docker-compose.yml
└── README.md
```

## Setup

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

### 2. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and backend runs at `http://localhost:5000`.

## Demo Credentials

Run the seed script first, then use:

- Admin: `admin@acme.com` / `Password123!`
- Security: `security@acme.com` / `Password123!`
- Employee: `employee@acme.com` / `Password123!`

## Main API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/visitors`
- `GET/POST /api/appointments`
- `PATCH /api/appointments/:id/status`
- `GET/POST /api/passes`
- `GET /api/passes/verify/:passCode`
- `POST /api/passes/scan/:passCode`
- `GET /api/passes/logs/export`

## Seed Data

The seed script creates:

- 3 users across admin, security, and employee roles
- 2 visitors
- 2 appointments
- 1 issued demo pass
- 1 check-in log

## Docker Bonus

```bash
docker compose up --build
```

This starts MongoDB, the Express API, and the React frontend.

## Demo Walkthrough

1. Login as admin.
2. Register a new visitor.
3. Create an appointment for that visitor.
4. Approve the appointment.
5. Issue a visitor pass and verify the QR panel.
6. Check the visitor in/out and export logs.

## Notes

- Email and SMS integrations are stubbed through service helpers so real providers can be added quickly.
- The frontend uses a pass-code verification flow in place of a camera QR scanner to keep the assignment lightweight and easy to run locally.
- Add screenshots or a short screen recording before submission if your evaluator expects them in the repository.
