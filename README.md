# Visitor Pass Management System

A full-stack MERN assignment project for digitizing visitor registration, appointment approval, QR-based visitor pass generation, and front-desk check-in/check-out operations.

## Live Demo

- Frontend: [https://visitors-pass-fosw.vercel.app](https://visitors-pass-fosw.vercel.app)
- Backend API: [https://visitors-pass-1.onrender.com](https://visitors-pass-1.onrender.com)
- GitHub Repository: [https://github.com/Navyagolash/Visitors-Pass](https://github.com/Navyagolash/Visitors-Pass)

## Objective

This project was built to replace manual visitor registers with a digital system that supports:

- visitor pre-registration
- appointment approval
- QR-based pass issuance
- PDF visitor badge generation
- visitor check-in and check-out tracking
- role-based access for admin, security, employee, and visitor users

## Features

- JWT authentication and role-based authorization
- Visitor registration with contact details, purpose, photo URL, and image upload
- Appointment creation and approval workflow
- QR-based visitor pass generation and camera scanning
- PDF badge generation on the backend with frontend badge download
- Check-in and check-out logging
- Dashboard for managing visitors, appointments, and passes
- CSV export for check logs
- Email notifications through SMTP
- SMS notifications through Twilio
- Seed script for demo data
- Multi-organization-ready schema using `organizationId`
- Docker support as a bonus feature

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express.js
- Database: MongoDB Atlas, Mongoose
- Authentication: JWT, bcryptjs
- Utilities: QRCode, PDFKit
- Deployment: Vercel, Render

## User Roles

- `admin`: manages the system, approvals, and pass issuance
- `security`: verifies passes and handles check-in/check-out
- `employee`: creates or manages visitor appointments
- `visitor`: can register and access pass-related flow

## Project Structure

```text
.
|-- backend
|-- frontend
|-- docs
|-- docker-compose.yml
`-- README.md
```

## Local Setup

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

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
EMAIL_FROM=noreply@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+15551234567
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Demo Credentials

Run the seed script first, then use:

- Admin: `admin@acme.com` / `Password123!`
- Security: `security@acme.com` / `Password123!`
- Employee: `employee@acme.com` / `Password123!`

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/visitors`
- `POST /api/visitors` accepts `multipart/form-data` with an optional `photo` image file
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id/status`
- `GET /api/passes`
- `POST /api/passes`
- `GET /api/passes/verify/:passCode`
- `POST /api/passes/scan/:passCode`
- `GET /api/passes/logs/export`

## Seed Data

The seed script creates:

- 3 demo users
- 2 visitors
- 2 appointments
- 1 issued pass
- 1 check-in log

## Deployment

### Frontend

- Hosted on Vercel
- Uses `frontend/vercel.json` for SPA route handling

### Backend

- Hosted on Render
- Connected to MongoDB Atlas

## Demo Flow

1. Open the live frontend.
2. Login with seeded admin credentials.
3. Register or create a visitor.
4. Create an appointment.
5. Approve the appointment.
6. Issue a pass.
7. Verify the pass.
8. Perform check-in and check-out.
9. Review saved data in MongoDB Atlas.

## Screenshots / Video

Add the final submission captures under `docs/screenshots/`:

| Flow | Screenshot |
| --- | --- |
| Login | `docs/screenshots/login.png` |
| Dashboard | `docs/screenshots/dashboard.png` |
| Appointment approval | `docs/screenshots/appointment-approval.png` |
| Pass issuance and PDF badge | `docs/screenshots/pass-issuance.png` |
| QR scan, check-in, and check-out | `docs/screenshots/check-in-out.png` |

Also include a short demo video link if your submission form provides a place for it.

## Bonus Points Covered

- Multi-organization-ready design
- QR-based pass workflow
- PDF badge generation
- Docker setup

## Notes

- Email requires real SMTP settings in the backend environment.
- SMS requires real Twilio settings in the backend environment.
- The live backend may take a few seconds to respond on the first request because Render free instances can sleep.
- The frontend uses SPA routing, so direct refresh on routes like `/login` and `/register` is supported through Vercel rewrite rules.
