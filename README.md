# SAMS — Smart Attendance Management System

## Project Structure
```
SAMS-Project/
├── frontend/   ← React + Vite + TypeScript + Tailwind
└── backend/    ← Node.js + Express + MongoDB + Socket.io
```

---

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

**Make sure MongoDB is running**, then seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```
Backend runs on: http://localhost:4000

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

---

## Seeded Test Accounts

After running `npm run seed`, you can log in with these accounts:

### Students (login with matricNo + password)
Check `backend/src/data/students.json` for matric numbers and passwords.

### Lecturers (login with lecturerId + password)
Check `backend/src/data/lecturers.json` for IDs and passwords.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/students/login | Student login | No |
| POST | /api/lecturers/login | Lecturer login | No |
| GET | /api/sessions/my-courses | Get lecturer's courses | JWT |
| POST | /api/sessions/create | Create attendance session | JWT |
| POST | /api/sessions/active | Get active sessions | JWT |
| POST | /api/attendance/mark | Mark student attendance | JWT |
| GET | /api/attendance/my-history | Student's attendance history | JWT |
| POST | /api/attendance/export/csv/:sessionId | Export CSV | JWT |
| POST | /api/attendance/export/excel/:sessionId | Export Excel | JWT |

---

## How It Works

1. **Lecturer** logs in → selects a course → sets duration → clicks "Generate QR"
2. Backend creates a session with a unique PIN and QR code (base64 image)
3. **Students** log in → go to "Mark Attendance" → enter the PIN (or scan QR)
4. Backend verifies PIN, marks student present, emits Socket.io event
5. Lecturer dashboard updates the live count in real-time via Socket.io
6. When session ends, lecturer can export attendance as CSV or Excel
